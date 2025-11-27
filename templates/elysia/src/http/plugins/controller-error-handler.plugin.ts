import Elysia, {
  InternalServerError as ElysiaInternalServerError,
} from "elysia";
import {
  BadRequestError,
  InternalServerError,
  UnprocessableEntityError,
} from "../errors";

function plugin() {
  return new Elysia({ name: "controller-error-handler-plugin" }).onError(
    { as: "scoped" },
    ({ code, error }) => {
      switch (code) {
        case "VALIDATION": {
          return new UnprocessableEntityError()
            .setCode("VALIDATION")
            .setDebug({
              elysiaCode: code,
              name: error.name,
              statusCode: error.status,
              message: JSON.parse(error.message),
            })
            .toController();
        }
        case "PARSE":
        case "INVALID_COOKIE_SIGNATURE":
        case "INVALID_FILE_TYPE":
          return new BadRequestError()
            .setCode("VALIDATION")
            .setMessage(UnprocessableEntityError.message)
            .setDebug({
              elysiaCode: code,
              name: error.name,
              statusCode: error.status,
              message: error.message,
            })
            .toController();
        case "INTERNAL_SERVER_ERROR":
        case "UNKNOWN":
          console.error(error);

          return new InternalServerError()
            .setDebug({
              elysiaCode: code,
              name: error.name,
              ...(error instanceof ElysiaInternalServerError && {
                statusCode: error.status,
              }),
              message: error.message,
            })
            .toController();
      }
    },
  );
}

export const controllerErrorHandlerPlugin = Object.freeze({
  plugin,
});
