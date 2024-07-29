import { DomainError } from "@/core/errors/domain-error";
import { ValidationError } from "@/core/errors/errors";
import { env } from "@/infra/env";
import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let httpException: HttpException;

    switch (exception.constructor) {
      case ValidationError:
        httpException = new BadRequestException(
          ErrorPresenter.toHttp(HttpStatus.BAD_REQUEST, exception),
        );
        break;

      default:
        httpException = new InternalServerErrorException(
          ErrorPresenter.toHttp(HttpStatus.INTERNAL_SERVER_ERROR, {
            error: "InternalServerError",
            message: "Desculpe, um erro inesperado ocorreu.",
            debug: exception.message,
          }),
        );
        break;
    }

    const httpResponse = httpException.getResponse();

    if (
      env.NODE_ENV === "production" &&
      typeof httpResponse === "object" &&
      "debug" in httpResponse
    )
      delete httpResponse.debug;

    response.status(httpException.getStatus()).send(httpResponse);
  }
}
