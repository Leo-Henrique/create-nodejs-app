import { HttpError } from "@/core/domain-error";

export class ValidationError extends HttpError {
  readonly statusCode = 400;
  readonly error = "VALIDATION_ERROR";

  constructor(
    public debug: unknown = null,
    public message = "Os dados enviados são inválidos.",
  ) {
    super(message);
  }
}
