import {
  FastifyZodInstance,
  FastifyZodReply,
  FastifyZodRequest,
} from "@/infra/http/@types/fastify-zod-type-provider";
import {
  RequestFormatError,
  UploadError,
} from "@/infra/http/errors/exceptions";
import { randomUUID } from "crypto";
import { HookHandlerDoneFunction } from "fastify";
import multer, { MulterError } from "fastify-multer";
import { Options } from "fastify-multer/lib/interfaces";
import { extension } from "mime-types";
import path, { extname } from "path";
import prettyBytes from "pretty-bytes";

interface MemoryStorage {
  storage?: "memory";
}

interface DiskStorage {
  storage?: "disk";
  storageDir?: string;
}

type Storage = MemoryStorage | DiskStorage;

type RequireUploadOptions = Storage & {
  fieldName: string;
  allowedExtensions: string[];
  limits?: Pick<NonNullable<Options["limits"]>, "fileSize" | "files">;
  isRequiredUpload?: boolean;
};

const defaultOptions = {
  storage: "memory",
  storageDir: "./tmp",
  limits: {
    fileSize: 1000000 * 10, // 10 MB
    files: 1,
  },
  isRequiredUpload: true,
};

export function requireUpload(
  options: RequireUploadOptions = { fieldName: "", allowedExtensions: [] },
) {
  const {
    storage,
    storageDir,
    fieldName,
    allowedExtensions,
    limits,
    isRequiredUpload,
  } = {
    ...defaultOptions,
    ...options,
    limits: {
      ...defaultOptions.limits,
      ...(options.limits ? options.limits : {}),
    },
  };
  const handleStorage = () => {
    if (storage === "disk") {
      return multer.diskStorage({
        destination: storageDir,
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);

          cb(null, `${randomUUID()}${ext}`);
        },
      });
    }

    return multer.memoryStorage();
  };

  const upload = multer({
    limits,
    storage: handleStorage(),
    fileFilter: (_req, { mimetype, originalname }, cb) => {
      const fileExtension = extension(mimetype) || extname(originalname);

      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true);
      } else {
        const validExtensions = allowedExtensions
          .map(ext => `"${ext}"`)
          .join(", ");

        cb(
          new UploadError(
            400,
            `Formato de arquivo inválido. Use apenas extensões: ${validExtensions}.`,
          ),
        );
      }
    },
  });
  const isMultipleUpload = limits.files > 1;

  return [
    async (req: FastifyZodRequest) => {
      if (!req.headers["content-type"]?.includes("multipart/form-data")) {
        throw new RequestFormatError(
          "A solicitação deve ser do tipo multipart/form-data.",
        );
      }
    },
    function (
      this: FastifyZodInstance,
      req: FastifyZodRequest,
      res: FastifyZodReply,
      done: HookHandlerDoneFunction,
    ) {
      let middleware = upload.single(fieldName);

      if (isMultipleUpload) middleware = upload.array(fieldName);

      middleware.bind(this)(req, res, error => {
        const sendError = (statusCode: number, message: string) => {
          done(new UploadError(statusCode, message));
        };

        if (error && error instanceof MulterError) {
          switch (error.code) {
            case "LIMIT_FILE_SIZE":
              return sendError(
                413,
                `O tamanho máximo de cada arquivo é ${prettyBytes(
                  limits.fileSize,
                )}.`,
              );

            case "LIMIT_FILE_COUNT":
              return sendError(
                413,
                `A contagem máxima de arquivos é ${limits.files}.`,
              );

            case "LIMIT_UNEXPECTED_FILE":
              return sendError(
                400,
                `O campo de arquivo '${error.field}' não é permitido.`,
              );

            default:
              return done(error);
          }
        }

        if (error) return done(error);

        done();
      });
    },
    async (req: FastifyZodRequest) => {
      if (isRequiredUpload) {
        if (!isMultipleUpload && !req.file) {
          throw new UploadError(
            400,
            `O campo '${fieldName}' é obrigatório com um arquivo.`,
          );
        }

        if (isMultipleUpload && (!req.files || !req.files.length)) {
          throw new UploadError(
            400,
            `O campo '${fieldName}' é obrigatório com no mínimo um arquivo.`,
          );
        }
      }

      const body = req.body as Record<string, string>;
      const parsedStringValues = Object.keys(body).reduce(
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

      if (
        req.routeOptions.schema &&
        req.routeOptions.schema.multipartAnotherFieldsSchema
      ) {
        req.routeOptions.schema.multipartAnotherFieldsSchema.parse(
          parsedStringValues,
        );
      }

      req.body = parsedStringValues;
    },
  ];
}
