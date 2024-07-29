import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

export class UploadValidationError extends HttpException {
  constructor(statusCode = 400, debug: object = {}) {
    const presenter = ErrorPresenter.toHttp(statusCode, {
      error: "UploadValidationError",
      message: "Os dados enviados são inválidos.",
      debug: {
        multerError: null,
        ...debug,
      },
    });

    super(presenter, statusCode);
  }
}
