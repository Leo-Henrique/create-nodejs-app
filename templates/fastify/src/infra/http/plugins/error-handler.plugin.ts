import { ValidationError } from "@/core/errors/errors";
import { env } from "@/infra/env";
import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { HttpError } from "../errors/http-error";

export async function errorHandlerPlugin(
  error: FastifyError,
  _req: FastifyRequest,
  res: FastifyReply,
) {
  console.error(error);

  let httpResponse: ReturnType<typeof ErrorPresenter.toHttp> =
    ErrorPresenter.toHttp(500, {
      error: "InternalServerError",
      message: "Desculpe, um erro inesperado ocorreu.",
      debug: error.message,
    });

  if (error.statusCode)
    httpResponse = ErrorPresenter.toHttp(error.statusCode, {
      error: error.name,
      message: error.message,
      debug: null,
    });

  if (error instanceof ValidationError)
    httpResponse = ErrorPresenter.toHttp(400, error);

  if (error instanceof ZodError)
    httpResponse = ErrorPresenter.toHttp(
      400,
      new ValidationError(error.flatten().fieldErrors),
    );

  if (error instanceof HttpError)
    httpResponse = ErrorPresenter.toHttp(error.statusCode, error);

  if (env.NODE_ENV === "production" && "debug" in httpResponse)
    delete httpResponse.debug;

  res.status(httpResponse.statusCode).send(httpResponse);
}
