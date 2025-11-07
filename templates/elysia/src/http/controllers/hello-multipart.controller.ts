import Elysia, { status } from "elysia";
import z from "zod";
import { ValidationError } from "../errors";
import { globalErrorHandlerPlugin } from "../plugins/global-error-handler.plugin";

export const helloMultipartController = new Elysia().post(
  "/hello/multipart",
  ({ query, body }) => {
    const { show } = query;
    const { attachment } = body;

    if (!show)
      return new ValidationError()
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
        .mime("text/plain"),
    }),
    parse: "multipart/form-data",
    response: {
      ...globalErrorHandlerPlugin.getErrorSchemas(),
      "422": new ValidationError().toZodSchema({ isMessageLiteral: false }),
    },
    detail: {
      operationId: "helloMultipartController",
      tags: ["Hello"],
      summary: "Hello world multipart!",
    },
  },
);
