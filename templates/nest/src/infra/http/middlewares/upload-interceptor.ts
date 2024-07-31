import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
  applyDecorators,
} from "@nestjs/common";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { randomUUID } from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";
import multer, {
  MulterError,
  diskStorage,
  memoryStorage,
} from "fastify-multer";
import { File, FileFilter, StorageEngine } from "fastify-multer/lib/interfaces";
import { extension } from "mime-types";
import { extname } from "path";
import prettyBytes from "pretty-bytes";
import { ZodObject, ZodRawShape, z } from "zod";
import { UploadValidationError } from "../errors/upload-validation.error";
import { zodSchemaToSwaggerSchema } from "./zod-schema-pipe";

interface MemoryStorage {
  /**
   * The in-memory storage mechanism stores the files in memory as ```Buffer```.
   *
   * WARNING: Loading very large files or relatively small files in large quantities very quickly may cause your application to run out of memory when memory storage is used.
   */
  storage: "memory";
}

interface DiskStorage {
  /**
   * The disk storage mechanism delegates the file processing to the machine and provides full control of the file on disk.
   *
   * Ideal for most cases and essential for large files.
   */
  storage: "disk";
  /**
   * File storage directory.
   *
   * @default "./tmp"
   */
  destination?: string;
}

type Storage = MemoryStorage | DiskStorage;

type UploadInterceptorOptions = Storage & {
  /**
   * Name of the file field that will be read when sent in the request with the multipart/form-data format.
   *
   * @example "attachment"
   */
  fieldName: string;
  /**
   * Allowed file extensions. Pass an empty array or ignore this option to accept all file formats.
   *
   * @default []
   * @example ["jpeg", "png"]
   */
  allowedExtensions?: string[];
  /**
   * Mandatory file upload.
   *
   * If a number is specified, a minimum number of files is required (specify the maximum number with the ```maxFileCount``` option).
   *
   * @default true
   */
  required?: boolean | number;
  /**
   * Maximum number of files allowed for the same field.
   *
   * @default 1
   */
  maxFileCount?: number;
  /**
   * Maximum size allowed for each file in megabytes (MB).
   *
   * @default 50 // 50MB
   * @example
   * 1 / 1000 // 1KB
   * 1 // 1MB
   * 1000 // 1GB
   * 1000 * 100 // 100GB
   * Infinity
   */
  maxFileSize?: number;
  /**
   * A zod schema that matches all non-file fields.
   *
   * Non-file field values are automatically ```JSON.parse()``` whenever possible, allowing you to send structures that are the same as the ```application/json``` format.
   *
   * WARN: The zod schema is only used to be added to Swagger. To validate, use the ```ZodSchemaPipe``` decorator with the ```isMultipart: true``` option.
   */
  nonFileFieldsZodSchema?: ZodObject<ZodRawShape>;
  /**
   * Maximum allowed size for each non-file field values in megabytes (MB).
   *
   * @default 1 // 1MB
   * @example
   * 1 / 1000 // 1KB
   * 1 // 1MB
   * 1000 // 1GB
   * 1000 * 100 // 100GB
   * Infinity
   */
  maxNonFileFieldSize?: number;
};

/**
 * Assumes the request body as multipart/form-data. Useful for file uploads.
 */
export function UploadInterceptor(options: UploadInterceptorOptions) {
  const {
    fieldName,
    storage,
    destination,
    required,
    maxFileCount,
    maxFileSize,
    nonFileFieldsZodSchema,
    maxNonFileFieldSize,
    ...restOptions
  } = {
    destination: "./tmp",
    allowedExtensions: [],
    required: true,
    maxFileCount: 1,
    maxFileSize: 50,
    nonFileFieldsZodSchema: z.object({}),
    maxNonFileFieldSize: 1,
    ...options,
  };
  const nonFileFieldsSwaggerSchema = zodSchemaToSwaggerSchema(
    nonFileFieldsZodSchema,
  );

  let allowedExtensions = restOptions.allowedExtensions;

  allowedExtensions = allowedExtensions.map(ext => ext.replace(".", ""));

  const getMulterStorage = (): StorageEngine => {
    if (storage === "disk") {
      return diskStorage({
        destination,
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);

          cb(null, `${randomUUID()}${ext}`);
        },
      });
    }

    return memoryStorage();
  };
  const setMulterFileFilter: FileFilter = (
    _req,
    { mimetype, originalname, fieldname },
    cb,
  ) => {
    if (
      !allowedExtensions ||
      (allowedExtensions && allowedExtensions.length < 1)
    ) {
      return cb(null, true);
    }

    const fileExtension =
      extension(mimetype) || extname(originalname).replace(".", "");

    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new UploadValidationError(400, {
          message: "Invalid file format.",
          fieldName: fieldname,
          allowedExtensions,
        }),
      );
    }
  };

  const getFileFieldSwaggerSchema = (): SchemaObject => {
    if (maxFileCount > 1)
      return {
        type: "array",
        items: {
          type: "string",
          format: "binary",
        },
      };

    return {
      type: "string",
      format: "binary",
    };
  };
  const getRequiredFieldsSwaggerSchema = (): SchemaObject["required"] => {
    const fields: string[] = [];

    if (required) fields.push(fieldName);

    if (nonFileFieldsSwaggerSchema.required)
      fields.push(...nonFileFieldsSwaggerSchema.required);

    return fields;
  };

  const megabytesToBytes = (mb: number) => mb * 1000 * 1000;

  return applyDecorators(
    UseInterceptors(
      new ExecuteUploadInterceptor({
        multerInstance: multer({
          storage: getMulterStorage(),
          fileFilter: setMulterFileFilter,
          limits: {
            files: maxFileCount,
            fileSize: megabytesToBytes(maxFileSize),
            fields: Object.keys(nonFileFieldsZodSchema.shape).length,
            fieldSize: megabytesToBytes(maxNonFileFieldSize),
          },
        }),
        fieldName,
        required,
      }),
    ),
    ApiConsumes("multipart/form-data"),
    ApiBody({
      schema: {
        type: "object",
        properties: {
          [fieldName]: getFileFieldSwaggerSchema(),
          ...nonFileFieldsSwaggerSchema.properties,
        },
        required: getRequiredFieldsSwaggerSchema(),
      },
    }),
  );
}

interface ExecuteUploadInterceptorParams {
  multerInstance: ReturnType<typeof multer>;
  fieldName: string;
  required: boolean | number;
}

interface FastifyRequestWithFile extends FastifyRequest {
  file?: File;
  files?: File[];
}

export class ExecuteUploadInterceptor implements NestInterceptor {
  public constructor(private params: ExecuteUploadInterceptorParams) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const { multerInstance, fieldName, required } = this.params;
    const limits = multerInstance.limits!;
    const isMultipleUpload = limits.files! > 1;

    let middleware = multerInstance.single(fieldName);

    if (isMultipleUpload) middleware = multerInstance.array(fieldName);

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<FastifyRequestWithFile>();
    const response = ctx.getResponse<FastifyReply>();

    await new Promise<void>((resolve, reject) => {
      // @ts-expect-error the method is not passed to the fastify pre hook handler
      middleware(request, response, error => {
        if (error && error instanceof MulterError) {
          switch (error.code) {
            case "LIMIT_FILE_COUNT":
              reject(
                new UploadValidationError(413, {
                  multerError: error.code,
                  message: error.message,
                  maxFileCount: limits.files!,
                }),
              );
              break;

            case "LIMIT_FILE_SIZE":
              reject(
                new UploadValidationError(413, {
                  multerError: error.code,
                  message: error.message,
                  fieldName: error.field,
                  maxFileSize: prettyBytes(limits.fileSize!),
                }),
              );
              break;

            default:
              reject(
                new UploadValidationError(
                  error.code === "LIMIT_UNEXPECTED_FILE" ? 400 : 413,
                  {
                    multerError: error.code,
                    message: error.message,
                    fieldName: error.field,
                  },
                ),
              );
              break;
          }
        }

        if (error) return reject(error);

        resolve();
      });
    });

    if (required && !isMultipleUpload && !request.file) {
      throw new UploadValidationError(400, {
        multerError: null,
        message: `Field "${fieldName}" is required with a file.`,
      });
    }

    const minFileCountIsMissing =
      typeof required === "number" &&
      request.files &&
      request.files.length < required;

    if (
      required &&
      isMultipleUpload &&
      (!request.files || !request.files.length || minFileCountIsMissing)
    ) {
      const minFileCount = typeof required === "number" ? required : 1;

      throw new UploadValidationError(400, {
        multerError: null,
        message: `Field "${fieldName}" is required with at least ${minFileCount} file(s).`,
      });
    }

    const parseNonFileFields = () => {
      const body = request.body as Record<string, string>;

      return Object.keys(body).reduce(
        (obj, key) => {
          const value = body[key];

          try {
            obj[key] = JSON.parse(value);
          } catch {
            obj[key] = value;
          }

          return obj;
        },
        {} as typeof body,
      );
    };

    request.body = parseNonFileFields();

    return next.handle();
  }
}
