import { FastifyZodReply, FastifyZodRequest } from "@/@types/fastify";
import { FastifyError } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { BaseError, InternalServerError, ValidationError } from "../errors";
import { multipartFormDataPluginErrorCodes } from "./multipart-form-data.plugin";

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

    case error instanceof Error && error.name === "FastifyError": {
      const fastifyError = error as FastifyError;

      if (fastifyError.code.startsWith("FST_ERR_CTP")) {
        httpError = new ValidationError(error);
        break;
      }

      const multipartErrorCodes =
        multipartFormDataPluginErrorCodes as unknown as string[];

      if (multipartErrorCodes.includes(fastifyError.code)) {
        if ("part" in error) delete error.part;

        httpError = new ValidationError(error);
        break;
      }

      httpError = new InternalServerError(error);
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
