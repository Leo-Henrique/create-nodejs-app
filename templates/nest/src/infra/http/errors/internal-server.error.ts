import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

export class InternalServerError extends HttpException {
  constructor(debug: unknown) {
    const statusCode = 500;
    const presenter = ErrorPresenter.toHttp(statusCode, {
      error: "InternalServerError",
      message: "Desculpe, um erro inesperado ocorreu.",
      debug,
    });

    super(presenter, statusCode);
  }
}
