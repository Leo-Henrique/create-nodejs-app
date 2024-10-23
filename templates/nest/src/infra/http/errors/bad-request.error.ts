import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

export class BadRequestError extends HttpException {
  static readonly statusCode = 400;
  static readonly error = "BAD_REQUEST_ERROR";
  static readonly debug = null;

  constructor(public message: string) {
    super(
      ErrorPresenter.toHttp(BadRequestError.statusCode, {
        ...BadRequestError,
        message,
      }),
      BadRequestError.statusCode,
    );
  }
}
