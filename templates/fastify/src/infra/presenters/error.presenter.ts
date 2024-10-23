import { DomainErrorCoreProperties } from "@/core/domain-error";
import { env } from "../env";

export class ErrorPresenter {
  public static toHttp(statusCode: number, error: DomainErrorCoreProperties) {
    return {
      error: error.error,
      message: error.message,
      statusCode,
      debug: env.NODE_ENV !== "production" ? error.debug : null,
    };
  }
}
