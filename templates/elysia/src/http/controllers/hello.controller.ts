import Elysia, { status } from "elysia";
import z from "zod";
import { UnprocessableEntityError } from "../errors";
import { controllerErrorHandlerPlugin } from "../plugins/controller-error-handler.plugin";

export const helloController = new Elysia()
  .use(controllerErrorHandlerPlugin.plugin)
  .get(
    "/hello",
    ({ query }) => {
      const { show } = query;

      if (!show)
        return new UnprocessableEntityError()
          .setCode("VALIDATION")
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
      detail: {
        operationId: "helloController",
        tags: ["Hello"],
        summary: "Hello world!",
      },
    },
  );
