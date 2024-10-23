import { requireUpload } from "@/infra/http/plugins/require-upload.plugin";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const helloMultipartControllerBodySchema = z.object({
  description: z.string().min(2),
});

export type HelloMultipartControllerBody = z.infer<
  typeof helloMultipartControllerBodySchema
>;

export async function helloMultipartController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/hello/multipart",
    schema: {
      tags: ["Hello"],
      summary: "Hello world with multipart/form-data content-type!",
      consumes: ["multipart/form-data"],
      multipartFileFields: ["attachment"],
      multipartAnotherFieldsSchema: helloMultipartControllerBodySchema,
      response: {
        200: z.object({
          message: z.literal("Hello world!"),
          description: z.string().min(2),
          file: z.object({
            fieldname: z.string(),
            originalname: z.string(),
            encoding: z.string(),
            mimetype: z.string(),
            size: z.number().optional(),
          }),
        }),
      },
    },
    preHandler: requireUpload({
      fieldName: "attachment",
      storage: "memory",
      allowedExtensions: ["jpeg", "png", "webp"],
      limits: {
        fileSize: 10 * 1000 * 1000, // 10MB
        files: 1,
      },
    }),
    handler: async (req, res) => {
      const { fieldname, originalname, encoding, mimetype, size } = req.file;
      const { description } =
        req.body as unknown as HelloMultipartControllerBody;

      res.status(200).send({
        message: "Hello world!",
        description,
        file: {
          fieldname,
          originalname,
          encoding,
          mimetype,
          size,
        },
      });
    },
  });
}
