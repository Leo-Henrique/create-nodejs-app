import { FastifyZodReply, FastifyZodRequest } from "@/@types/fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { BaseError, InternalServerError, ValidationError } from "../errors";

export function errorHandlerPlugin(
  error: unknown,
  _request: FastifyZodRequest,
  response: FastifyZodReply,
) {
  let httpError: BaseError;

  if (error instanceof BaseError) {
    httpError = error;
  } else if (error instanceof SyntaxError) {
    httpError = new ValidationError(error.message);
  } else if (hasZodFastifySchemaValidationErrors(error)) {
    httpError = new ValidationError(error.validation);
  } else {
    httpError = new InternalServerError(error);
  }

  const isCriticalError = httpError.statusCode.toString().startsWith("5");

  if (isCriticalError) {
    console.error(error);
  }

  return response.status(httpError.statusCode).send(httpError.serialize());
}
