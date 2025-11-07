import Elysia, { status } from "elysia";
import z from "zod";
import { ValidationError } from "../errors";
import { globalErrorHandlerPlugin } from "../plugins/global-error-handler.plugin";

export const helloController = new Elysia().get(
  "/hello",
  ({ query }) => {
    const { show } = query;

    if (!show)
      return new ValidationError()
        .setMessage("Você não quer exibir o 'Hello world' :(")
        .setDebug(
          "Utilize o parâmetro de consulta 'show' com o valor 'true' para exibir o 'Hello world'.",
        )
        .toController();

    return status(200, { message: "Hello world!" });
  },
  {
    query: z.object({
      show: z
        .enum(["true", "false"])
        .transform<boolean>((val) => JSON.parse(val)),
    }),
    response: {
      ...globalErrorHandlerPlugin.getErrorSchemas(),
      "422": new ValidationError().toZodSchema({ isMessageLiteral: false }),
    },
    detail: {
      operationId: "helloController",
      tags: ["Hello"],
      summary: "Hello world!",
    },
  },
);
