import { DomainError } from "./domain-error";

export class ValidationError extends DomainError {
  public error = "ValidationError";
  public HTTPStatusCode = 400;

  constructor(public debug: object | null = null) {
    super("Os dados enviados são inválidos.");
  }
}
