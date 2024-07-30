import { HTTPErrorHandler } from "@/infra/http/errors/http-error-handler";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export async function errorHandlerPlugin(
  error: FastifyError,
  _req: FastifyRequest,
  response: FastifyReply,
) {
  console.error(error);

  const methodNames = Object.getOwnPropertyNames(HTTPErrorHandler.prototype);
  const unknownErrorName = "unknownErrorHandler";
  const handlerNames = methodNames.filter(name => {
    return name.endsWith("ErrorHandler") && !name.includes(unknownErrorName);
  });

  handlerNames.push(unknownErrorName);

  const handlerInstance = new HTTPErrorHandler(error, response);

  for (const handlerName of handlerNames) {
    const hasError =
      await handlerInstance[handlerName as keyof HTTPErrorHandler]();

    if (hasError) break;
  }
}
