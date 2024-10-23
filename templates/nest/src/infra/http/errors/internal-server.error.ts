import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

export class InternalServerError extends HttpException {
  static readonly statusCode = 500;
  static readonly error = "INTERNAL_SERVER_ERROR";
  static readonly message = "Desculpe, um erro inesperado ocorreu.";

  constructor(debug: unknown) {
    super(
      ErrorPresenter.toHttp(InternalServerError.statusCode, {
        ...InternalServerError,
        debug,
      }),
      InternalServerError.statusCode,
    );
  }
}
