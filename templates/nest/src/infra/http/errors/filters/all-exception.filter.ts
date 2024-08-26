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

    const debug =
      exception && typeof exception === "object" && "message" in exception
        ? exception.message
        : null;

    let httpException: HttpException = new InternalServerError(debug);

    if (exception instanceof HttpException) httpException = exception;

    console.error(exception);

    response
      .status(httpException.getStatus())
      .send(httpException.getResponse());
  }
}
