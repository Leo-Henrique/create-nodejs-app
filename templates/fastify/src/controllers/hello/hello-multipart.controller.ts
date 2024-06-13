import { requireUpload } from "@/plugins/require-upload.plugin";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const helloMultipartControllerBodySchema = z.object({
  description: z.string().min(2),
});

type HelloMultipartControllerBody = z.infer<
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
          message: z.string(),
          description: z.string(),
          file: z.custom(),
        }),
      },
    },
    preHandler: requireUpload({
      fieldName: "attachment",
      allowedExtensions: ["png", "jpg", "jpeg", "webp"],
      limits: { fileSize: 1000000 * 15, files: 1 },
      storage: "memory",
    }),
    handler: async (req, res) => {
      // eslint-disable-next-line
      const { buffer, ...fileInfo } = req.file;
      const { description } =
        req.body as unknown as HelloMultipartControllerBody;

      res.status(200).send({
        message: "Hello world!",
        description,
        file: fileInfo,
      });
    },
  });
}
