import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

export class ValidationError extends HttpException {
  static readonly statusCode = 400;
  static readonly error = "VALIDATION_ERROR";

  constructor(
    public debug: unknown = null,
    public message = "Os dados enviados são inválidos.",
  ) {
    super(
      ErrorPresenter.toHttp(ValidationError.statusCode, {
        ...ValidationError,
        message,
        debug,
      }),
      ValidationError.statusCode,
    );
  }
}
