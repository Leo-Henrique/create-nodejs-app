import { HttpError } from "@/core/domain-error";

export class BadRequestError extends HttpError {
  readonly error = "BAD_REQUEST_ERROR";
  readonly statusCode = 400;
  readonly debug = null;

  constructor(public message: string) {
    super(message);
  }
}
