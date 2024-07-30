import { env } from "@/infra/env";
import { FastifyError, FastifyReply } from "fastify";
import { MulterError } from "fastify-multer";
import { SetOptional } from "type-fest";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import {
  BaseError,
  HTTPError,
  UnauthorizedError,
  UploadError,
} from "./exceptions";

export class HTTPErrorHandler {
  constructor(
    protected error: FastifyError,
    protected response: FastifyReply,
  ) {}

  protected send({
    statusCode,
    error,
    message,
    debug,
  }: SetOptional<BaseError, "debug" | "name">) {
    const parsedDebug = () => {
      if (!debug || env.NODE_ENV !== "development") return {};

      return { debug };
    };

    this.response
      .status(statusCode)
      .send({ statusCode, error, message, ...parsedDebug() });

    return true;
  }

  async customHTTPErrorHandler() {
    if (this.error instanceof HTTPError) return this.send(this.error);
  }

  async unknownErrorHandler() {
    if (this.error instanceof BaseError) return this.send(this.error);

    if (this.error.statusCode) {
      return this.send({
        statusCode: this.error.statusCode,
        error: this.error.name,
        message: this.error.message,
      });
    }

    return this.send({
      statusCode: 500,
      error: "InternalServerError",
      message: "Desculpe, um erro inesperado ocorreu.",
      debug: this.error.message,
    });
  }

  async JWTErrorHandler() {
    if (this.error.code && this.error.code.includes("_JWT_")) {
      const { statusCode, error, message } = new UnauthorizedError();

      return this.send({
        statusCode: this.error.statusCode || statusCode,
        error,
        message,
        debug: this.error.message,
      });
    }
  }

  async multerErrorHandler() {
    if (
      this.error instanceof MulterError ||
      this.error instanceof UploadError
    ) {
      return this.send({
        statusCode: (this.error as UploadError)?.statusCode || 400,
        error: (this.error as UploadError).error || "UploadError",
        message: this.error.message,
      });
    }

    if (this.error.message === "Multipart: Boundary not found") {
      return this.send({
        statusCode: 415,
        error: "UnsupportedMultipartMediaTypeError",
        message: "Cabeçalho multipart inválido.",
      });
    }
  }

  async zodErrorHandler() {
    if (this.error instanceof ZodError) {
      const { message } = fromZodError(this.error, {
        maxIssuesInMessage: 1,
        prefix: null,
      });

      return this.send({
        statusCode: 400,
        error: "ValidationError",
        message: message,
        debug: this.error.flatten().fieldErrors,
      });
    }
  }
}
