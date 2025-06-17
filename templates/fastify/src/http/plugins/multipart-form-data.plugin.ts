import { FastifyZodInstance } from "@/@types/fastify";
import { env } from "@/env";
import fastifyMultipart, { MultipartFile } from "@fastify/multipart";
import { errorCodes } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { z } from "zod";
import { ValidationError } from "../errors";

type InMemoryAttachmentStorage = {
  /**
   * File storage strategy.
   *
   * @default "disk"
   */
  storage?: "in-memory";
};

type DiskAttachmentStorage = {
  storage?: "disk";
  /**
   * File storage directory.
   *
   * @default env.TMP_FILES_PATH
   */
  destinationPath?: string;
  /**
   * Remove files after route handler execution
   *
   * @default true
   */
  removeAfterHandlerExecution?: boolean;
};

type AttachmentsStorage = InMemoryAttachmentStorage | DiskAttachmentStorage;

type MultipartFormDataPluginOptions = {
  attachments?: AttachmentsStorage & {
    /**
     * Allowed mime types of files.
     *
     * @example ["image/webp", "image/jpeg"]
     *
     * @default []
     */
    allowedMimeTypes?: string[];
    /**
     * Maximum number of files allowed.
     *
     * @default 1
     */
    maxCount?: number;
    /**
     * Maximum size allowed for each file in bytes.
     *
     * @default 1024 * 1024 * 10 // 10MB
     */
    maxSize?: number;
  };
};

const plugin = fastifyPlugin(
  (app: FastifyZodInstance, _options: MultipartFormDataPluginOptions, done) => {
    const options = {
      ..._options,
      attachments: {
        storage: "disk",
        destinationPath: env.TMP_FILES_PATH,
        removeAfterHandlerExecution: true,
        allowedMimeTypes: [],
        maxCount: 1,
        maxSize: 1024 * 1024 * 10, // 10MB
        ..._options.attachments,
      },
    } satisfies MultipartFormDataPluginOptions;

    app.addHook("onRequest", async request => {
      const contentType = request.headers["content-type"];
      const { FST_ERR_CTP_INVALID_MEDIA_TYPE } = errorCodes;

      if (!contentType?.startsWith("multipart/form-data")) {
        throw new ValidationError(FST_ERR_CTP_INVALID_MEDIA_TYPE(contentType));
      }
    });

    app.register(fastifyMultipart, {
      attachFieldsToBody: "keyValues",
      limits: {
        fieldNameSize: 100,
        fieldSize: 1024 * 1024, // 1MB
        fields: Infinity,
        parts: Infinity,
        headerPairs: 2000,
        files: options.attachments.maxCount,
        fileSize: options.attachments.maxSize,
      },
      async onFile(file) {
        const allowedMimeTypes = options.attachments
          .allowedMimeTypes as string[];

        if (
          !allowedMimeTypes.includes(file.mimetype) &&
          !allowedMimeTypes.length
        ) {
          throw new ValidationError(
            `Nenhum MIME type de arquivo foi configurado para ser aceito.`,
          );
        }

        if (
          !allowedMimeTypes.includes(file.mimetype) &&
          allowedMimeTypes.length
        ) {
          throw new ValidationError(
            `Apenas os seguintes MIME types são aceitos: ${allowedMimeTypes.join(", ")}.`,
          );
        }

        if (options.attachments.storage === "in-memory") {
          const buffer = await file.toBuffer();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (file as any).value = new MultipartFormDataInMemoryFile(file, buffer);
          return;
        }

        const uniqueFileName = randomUUID() + extname(file.filename);
        const filePath = resolve(env.TMP_FILES_PATH, uniqueFileName);

        await pipeline(file.file, createWriteStream(filePath));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (file as any).value = new MultipartFormDataDiskFile(file, filePath);
      },
    });

    if (
      options.attachments.storage === "disk" &&
      options.attachments.removeAfterHandlerExecution
    ) {
      app.addHook("onResponse", async request => {
        if (!request.body || typeof request.body !== "object") return;

        const bodyDiskFiles = Object.values(request.body)
          .filter(value => {
            const valueIsDiskFile = value instanceof MultipartFormDataDiskFile;
            const valueIsArrayOfDiskFile =
              Array.isArray(value) &&
              value.some(item => item instanceof MultipartFormDataDiskFile);

            return valueIsDiskFile || valueIsArrayOfDiskFile;
          })
          .flat() as MultipartFormDataDiskFile[];

        if (!bodyDiskFiles.length) return;

        await Promise.all(
          bodyDiskFiles.map(diskFile => rm(diskFile.filePath, { force: true })),
        );
      });
    }

    done();
  },
);

export const multipartFormDataPlugin = Object.freeze({
  plugin,
} as const);

export const multipartFormDataPluginErrorCodes = [
  "FST_PARTS_LIMIT",
  "FST_FILES_LIMIT",
  "FST_FIELDS_LIMIT",
  "FST_REQ_FILE_TOO_LARGE",
  "FST_PROTO_VIOLATION",
  "FST_INVALID_MULTIPART_CONTENT_TYPE",
  "FST_INVALID_JSON_FIELD_ERROR",
  "FST_FILE_BUFFER_NOT_FOUND",
  "FST_NO_FORM_DATA",
] as const;

export const MULTIPART_FORM_DATA_FILE_SCHEMA_DESCRIPTION =
  "MULTIPART_FORM_DATA_ATTACHMENT";

export class MultipartFormDataFile {
  public type: MultipartFile["type"];
  public encoding: MultipartFile["encoding"];
  public mimetype: MultipartFile["mimetype"];
  public fileStream: MultipartFile["file"];
  public fileOriginalName: MultipartFile["filename"];

  public constructor(multipartFile: MultipartFile) {
    this.type = multipartFile.type;
    this.encoding = multipartFile.encoding;
    this.mimetype = multipartFile.mimetype;
    this.fileStream = multipartFile.file;
    this.fileOriginalName = multipartFile.filename;
  }
}

export class MultipartFormDataDiskFile extends MultipartFormDataFile {
  public fileName: string;
  public filePath: string;

  public constructor(multipartFile: MultipartFile, filePath: string) {
    super(multipartFile);

    this.fileName = basename(filePath);
    this.filePath = filePath;
  }

  public static get schema() {
    return z
      .instanceof(MultipartFormDataDiskFile)
      .describe(MULTIPART_FORM_DATA_FILE_SCHEMA_DESCRIPTION);
  }
}

export class MultipartFormDataInMemoryFile extends MultipartFormDataFile {
  public buffer: Buffer<ArrayBufferLike>;

  public constructor(
    multipartFile: MultipartFile,
    buffer: Buffer<ArrayBufferLike>,
  ) {
    super(multipartFile);

    this.buffer = buffer;
  }

  public static get schema() {
    return z
      .instanceof(MultipartFormDataInMemoryFile)
      .describe(MULTIPART_FORM_DATA_FILE_SCHEMA_DESCRIPTION);
  }
}
