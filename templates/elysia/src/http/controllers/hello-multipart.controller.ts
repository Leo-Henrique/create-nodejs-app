import Elysia, { status } from "elysia";
import z from "zod";
import { UnprocessableEntityError } from "../errors";
import { controllerErrorHandlerPlugin } from "../plugins/controller-error-handler.plugin";

export const helloMultipartController = new Elysia()
  .use(controllerErrorHandlerPlugin.plugin())
  .post(
    "/hello/multipart",
    ({ query, body }) => {
      const { show } = query;
      const attachment = body.attachment as z.core.File;

      if (!show)
        return new UnprocessableEntityError()
          .setCode("VALIDATION")
          .setMessage("Você não quer exibir o 'Hello world' :(")
          .setDebug(
            "Utilize o parâmetro de consulta 'show' com o valor 'true' para exibir o 'Hello world'.",
          )
          .toController();

      return status(200, {
        message: "Hello world!",
        attachment: {
          name: attachment.name,
          mimetype: attachment.type,
          size: attachment.size,
        },
      });
    },
    {
      query: z.object({
        show: z
          .enum(["true", "false"])
          .transform<boolean>((val) => JSON.parse(val)),
      }),
      body: z.object({
        attachment: z
          .file()
          .max(1024 * 1024 * 50) // 50MB
          .mime("text/plain")
          // BUG(@elysiajs/openapi 1.4.11): Elysia stops generating the open API response with "fromTypes" function for the current route when using z.file()
          // biome-ignore lint/suspicious/noExplicitAny: ↑
          .transform((val) => val as any),
      }),
      response: {
        // BUG(@elysiajs/openapi 1.4.11): Elysia is automatically inserting properties that it shouldn't for this class
        422: new UnprocessableEntityError()
          .setCode("VALIDATION")
          .toZodSchema()
          .or(
            new UnprocessableEntityError()
              .setCode("VALIDATION")
              .setMessage("Você não quer exibir o 'Hello world' :(")
              .toZodSchema(),
          ),
      },
      parse: "multipart/form-data",
      detail: {
        operationId: "helloMultipartController",
        tags: ["Hello"],
        summary: "Hello world multipart!",
      },
    },
  );
