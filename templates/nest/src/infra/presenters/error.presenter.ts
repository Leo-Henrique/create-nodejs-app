import { DomainError } from "@/core/errors/domain-error";

export interface HttpErrorPresenter {
  error: DomainError["error"];
  message: DomainError["message"];
  statusCode: DomainError["HTTPStatusCode"];
  debug?: DomainError["debug"];
}
