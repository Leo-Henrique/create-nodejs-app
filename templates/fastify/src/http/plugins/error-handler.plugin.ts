import { FastifyZodReply, FastifyZodRequest } from "@/@types/fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { BaseError, InternalServerError, ValidationError } from "../errors";

export function errorHandlerPlugin(
  error: unknown,
  _request: FastifyZodRequest,
  response: FastifyZodReply,
) {
  let httpError: BaseError;

  switch (true) {
    case error instanceof BaseError: {
      httpError = error;
      break;
    }

    case error instanceof SyntaxError: {
      httpError = new ValidationError(error.message);
      break;
    }

    case hasZodFastifySchemaValidationErrors(error): {
      httpError = new ValidationError(error.validation);
      break;
    }

    default: {
      httpError = new InternalServerError(error);
      break;
    }
  }

  const isCriticalError = httpError.statusCode.toString().startsWith("5");

  if (isCriticalError) {
    console.error(error);
  }

  return response.status(httpError.statusCode).send(httpError.serialize());
}
