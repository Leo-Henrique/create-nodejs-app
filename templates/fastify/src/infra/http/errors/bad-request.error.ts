import { HttpError } from "./http-error";

export class BadRequestError extends HttpError {
  public error = "BadRequestError";
  public statusCode = 400;
  public debug = null;

  constructor(public message: string) {
    super(message);
  }
}
