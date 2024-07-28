import { HttpErrorPresenter } from "@/infra/presenters/error.presenter";
import { HttpException } from "@nestjs/common";

interface UploadValidationErrorDebug {
  multerError: string | null;
  message: string;
}

export class UploadValidationError<
  Debug extends UploadValidationErrorDebug,
> extends HttpException {
  constructor(statusCode = 400, debug: Debug | null = null) {
    super(
      {
        error: "UploadValidationError",
        message: "Os dados enviados são inválidos.",
        statusCode,
        debug,
      } satisfies HttpErrorPresenter,
      statusCode,
    );
  }
}
