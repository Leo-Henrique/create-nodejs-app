import { HttpError } from "@/core/domain-error";
import { ErrorPresenter } from "@/infra/presenters/error.presenter";
import { FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { InternalServerError } from "../errors/internal-server.error";
import { ValidationError } from "../errors/validation.error";

export async function errorHandlerPlugin(
  error: unknown,
  _req: FastifyRequest,
  res: FastifyReply,
) {
  let httpError: HttpError;

  if (error instanceof HttpError) httpError = error;
  else if (error instanceof ZodError)
    httpError = new ValidationError(error.flatten().fieldErrors);
  else {
    const debugFromUnknownError =
      error && typeof error === "object" && "message" in error
        ? error.message
        : null;

    httpError = new InternalServerError(debugFromUnknownError);
    console.error(httpError);
  }

  const httpResponse = ErrorPresenter.toHttp(httpError.statusCode, httpError);

  res.status(httpResponse.statusCode).send(httpResponse);
}
