import { FastifyZodInstance } from "@/@types/fastify";
import { createControllerResponseSchema } from "@/core/fastify/create-controller-response-schema";
import { z } from "zod";
import { InternalServerError, ValidationError } from "../errors";
import {
  MultipartFormDataDiskFile,
  multipartFormDataPlugin,
} from "../plugins/multipart-form-data.plugin";

export const helloMultipartControllerMethod = "POST" as const;
export const helloMultipartControllerUrl = "/hello/multipart" as const;

export type HelloMultipartControllerBodyInput = z.input<
  typeof helloMultipartControllerBodySchema
>;

const helloMultipartControllerBodySchema = z.object({
  show: z
    .enum(["true", "false"])
    .transform<boolean>(val => JSON.parse(val))
    .default("true"),
  attachment: MultipartFormDataDiskFile.schema,
});

export default function helloMultipartController(app: FastifyZodInstance) {
  app.register(multipartFormDataPlugin.plugin, {
    attachments: {
      storage: "disk",
      allowedMimeTypes: ["text/plain"],
      maxCount: 1,
      maxSize: 1024 * 1024 * 50, // 50MB
    },
  });

  app.route({
    method: helloMultipartControllerMethod,
    url: helloMultipartControllerUrl,
    schema: {
      operationId: "helloMultipartController",
      tags: ["Hello"],
      summary: "Hello world!",
      consumes: ["multipart/form-data"],
      body: helloMultipartControllerBodySchema,
      response: createControllerResponseSchema(
        {
          200: z.object({
            message: z.literal("Hello world!"),
            attachment: z.custom(),
          }),
        },
        InternalServerError,
        ValidationError,
      ),
    },
    handler: async (request, response) => {
      const { show, attachment } = request.body;

      if (!show)
        return new ValidationError(`Você não quer exibir o "Hello world" :(`);

      response.status(200).send({
        message: "Hello world!",
        attachment: attachment,
      });
    },
  });
}
