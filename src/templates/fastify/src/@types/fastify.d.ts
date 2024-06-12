import { File } from "fastify-multer/lib/interfaces";
import { z } from "zod";

export type Upload<Base> = Omit<Base, "fields" | "type">;

declare module "fastify" {
  interface FastifyRequest {
    file: File;
    files: File[];
  }

  interface FastifySchema {
    multipartFileFields?: string[];
    multipartAnotherFieldsSchema?: z.ZodObject<z.ZodRawShape>;
  }
}
