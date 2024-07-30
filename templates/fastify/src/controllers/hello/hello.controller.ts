import { BadRequestError } from "@/errors/exceptions";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const helloControllerQuerySchema = z.object({
  show: z
    .enum(["true", "false"])
    .transform<boolean>(val => JSON.parse(val))
    .default("true"),
});

export async function helloController(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/hello",
    schema: {
      tags: ["Hello"],
      summary: "Hello world!",
      querystring: helloControllerQuerySchema,
      response: {
        200: z.object({
          message: z.literal("Hello world!"),
        }),
      },
    },
    handler: async (req, res) => {
      const { show } = req.query;

      if (!show)
        throw new BadRequestError(
          `You don't want to display the "hello world"!`,
        );

      res.status(200).send({ message: "Hello world!" });
    },
  });
}
