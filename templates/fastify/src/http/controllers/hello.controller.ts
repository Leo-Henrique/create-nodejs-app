import { FastifyZodInstance } from "@/@types/fastify";
import { createControllerResponseSchema } from "@/core/create-controller-response-schema";
import { z } from "zod";
import { InternalServerError, ValidationError } from "../errors";

export const helloControllerMethod = "GET" as const;
export const helloControllerUrl = "/hello" as const;

export type HelloControllerQueryParamsInput = z.input<
  typeof helloControllerQueryParamsInputSchema
>;

const helloControllerQueryParamsInputSchema = z.object({
  show: z
    .enum(["true", "false"])
    .transform<boolean>(val => JSON.parse(val))
    .default("true"),
});

export default function helloController(app: FastifyZodInstance) {
  app.route({
    method: helloControllerMethod,
    url: helloControllerUrl,
    schema: {
      operationId: "helloController",
      tags: ["Hello"],
      summary: "Hello world!",
      querystring: helloControllerQueryParamsInputSchema,
      response: createControllerResponseSchema(
        {
          200: z.object({
            message: z.literal("Hello world!"),
          }),
        },
        InternalServerError,
        ValidationError,
      ),
    },
    handler: async (request, response) => {
      const helloQueryParams = request.query;

      if (!helloQueryParams.show)
        return new ValidationError(`Você não quer exibir o "Hello world" :(`);

      response.status(200).send({ message: "Hello world!" });
    },
  });
}
