import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { FastifyReply } from "fastify";
import { InternalServerError } from "../internal-server.error";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    let httpError: HttpException;

    if (exception instanceof HttpException) httpError = exception;
    else {
      const debugFromUnknownError =
        exception && typeof exception === "object" && "message" in exception
          ? exception.message
          : null;

      httpError = new InternalServerError(debugFromUnknownError);
      console.error(httpError);
    }

    response.status(httpError.getStatus()).send(httpError.getResponse());
  }
}
