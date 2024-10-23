import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

export class UploadValidationError extends HttpException {
  static readonly error = "UPLOAD_VALIDATION_ERROR";

  constructor(
    public statusCode = 400,
    public debug = {},
  ) {
    super(
      ErrorPresenter.toHttp(statusCode, {
        ...UploadValidationError,
        message: "Os dados enviados são inválidos.",
        debug: {
          multerError: null,
          ...debug,
        },
      }),
      statusCode,
    );
  }
}
