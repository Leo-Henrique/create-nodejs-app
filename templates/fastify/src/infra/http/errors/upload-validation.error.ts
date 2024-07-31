import { HttpError } from "./http-error";

export class UploadValidationError extends HttpError {
  public error = "UploadValidationError";
  public debug = { multerError: null };

  constructor(
    public statusCode = 400,
    debug: object = {},
  ) {
    super("Os dados enviados são inválidos.");

    this.debug = { ...this.debug, ...debug };
  }
}
