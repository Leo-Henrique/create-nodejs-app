import { HttpError } from "@/core/domain-error";

const message = "Desculpe, um erro inesperado ocorreu.";

export class InternalServerError extends HttpError {
  readonly statusCode = 500;
  readonly error = "INTERNAL_SERVER_ERROR";
  readonly message = message;

  constructor(public debug: unknown) {
    super(message);
  }
}
