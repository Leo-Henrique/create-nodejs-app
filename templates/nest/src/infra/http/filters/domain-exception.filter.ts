import { DomainError } from "@/core/errors/domain-error";
import { ValidationError } from "@/core/errors/errors";
import { env } from "@/infra/env";
import { HttpErrorPresenter } from "@/infra/presenters/error.presenter";
import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
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
        httpException = new BadRequestException({
          error: exception.error,
          message: exception.message,
          statusCode: exception.HTTPStatusCode,
          debug: exception.debug,
        } satisfies HttpErrorPresenter);
        break;

      default:
        httpException = new InternalServerErrorException({
          error: "InternalServerError",
          message: "Desculpe, um erro inesperado ocorreu.",
          statusCode: 500,
          debug: exception.message,
        } satisfies HttpErrorPresenter);
        break;
    }

    if (env.NODE_ENV === "production" && "debug" in httpException)
      delete exception.debug;

    response
      .status(httpException.getStatus())
      .send(httpException.getResponse());
  }
}
