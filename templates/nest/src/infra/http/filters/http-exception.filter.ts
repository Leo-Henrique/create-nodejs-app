import { env } from "@/infra/env";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { FastifyReply } from "fastify";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(httpException: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
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
