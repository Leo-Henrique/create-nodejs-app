import { HttpError } from "@/core/domain-error";

const message = "Os dados enviados são inválidos.";

export class UploadValidationError extends HttpError {
  readonly error = "UPLOAD_VALIDATION_ERROR";
  readonly message = message;
  public debug: object;

  constructor(
    public statusCode = 400,
    debug = {},
  ) {
    super(message);

    this.debug = {
      multerError: null,
      ...debug,
    };
  }
}
