import { env } from "@/env";
import { z } from "zod";

export abstract class BaseError extends Error {
  public abstract error: string;
  public abstract statusCode: number;
  public abstract debug: unknown;

  public createSchema<Error extends BaseError>() {
    return z
      .object({
        error: z.literal(this.error as Error["error"]),
        statusCode: z.literal(this.statusCode as Error["statusCode"]),
        message: this.message
          ? z.literal(this.message as Error["message"])
          : z.string(),
        debug: z.unknown(),
      })
      .describe(this.error);
  }

  public serialize() {
    return {
      error: this.error,
      statusCode: this.statusCode,
      message: this.message,
      ...(env.NODE_ENV !== "production" && {
        debug: this.debug,
      }),
    };
  }
}

export class InternalServerError extends BaseError {
  public readonly error = "INTERNAL_SERVER_ERROR";
  public readonly statusCode = 500;
  public readonly message =
    "Desculpe, um erro inesperado ocorreu. Tente novamente alguns minutos ou nos contate.";

  public constructor(public debug: unknown) {
    super();
  }

  public get schema() {
    return this.createSchema<InternalServerError>();
  }
}

export class ValidationError extends BaseError {
  public readonly error = "VALIDATION_ERROR";
  public readonly statusCode = 400;
  public readonly message = "Os dados enviados são inválidos.";

  public constructor(public debug: unknown) {
    super();
  }

  public get schema() {
    return this.createSchema<ValidationError>();
  }
}

export class ResourceNotFoundError extends BaseError {
  public readonly error = "RESOURCE_NOT_FOUND_ERROR";
  public readonly statusCode = 404;
  public readonly debug = null;

  public constructor(public message: string) {
    super(message);
  }

  public get schema() {
    return this.createSchema<ResourceNotFoundError>();
  }
}

export class ResourceAlreadyExistsError extends BaseError {
  public readonly error = "RESOURCE_ALREADY_EXISTS_ERROR";
  public readonly statusCode = 409;
  public readonly debug = null;

  public constructor(public message: string) {
    super();
  }

  public get schema() {
    return this.createSchema<ResourceAlreadyExistsError>();
  }
}
