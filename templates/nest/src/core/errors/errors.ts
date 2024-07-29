import { DomainError } from "./domain-error";

export class ValidationError extends DomainError {
  public error = "ValidationError";

  constructor(public debug: object | null = null) {
    super("Os dados enviados são inválidos.");
  }
}
