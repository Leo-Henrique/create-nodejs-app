import {
  FastifyZodInstance,
  FastifyZodReply,
  FastifyZodRequest,
} from "@/infra/http/@types/fastify-zod-type-provider";
import { randomUUID } from "crypto";
import multer, { MulterError } from "fastify-multer";
import { Options } from "fastify-multer/lib/interfaces";
import { extension } from "mime-types";
import path, { extname } from "path";
import prettyBytes from "pretty-bytes";
import { UploadValidationError } from "../errors/upload-validation.error";

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
        cb(
          new UploadValidationError(400, {
            message: "Invalid file format.",
            fieldName,
            allowedExtensions,
          }),
        );
      }
    },
  });
  const isMultipleUpload = limits.files > 1;

  return [
    async function (
      this: FastifyZodInstance,
      req: FastifyZodRequest,
      res: FastifyZodReply,
    ) {
      let middleware = upload.single(fieldName);

      if (isMultipleUpload) middleware = upload.array(fieldName);

      await new Promise<void>((resolve, reject) => {
        middleware.bind(this)(req, res, error => {
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
    },
    async (req: FastifyZodRequest) => {
      if (isRequiredUpload) {
        if (!isMultipleUpload && !req.file) {
          throw new UploadValidationError(400, {
            multerError: null,
            message: `Field "${fieldName}" is required with a file.`,
          });
        }

        if (isMultipleUpload && (!req.files || !req.files.length)) {
          throw new UploadValidationError(400, {
            multerError: null,
            message: `Field "${fieldName}" is required with at least 1 file.`,
          });
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
