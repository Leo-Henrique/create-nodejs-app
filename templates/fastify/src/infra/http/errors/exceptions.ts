import { capitalizeWord } from "@/utils/capitalize-word";

export abstract class BaseError extends Error {
  public abstract error: string;
  public abstract statusCode: number;
  public debug: unknown = null;

  constructor(public message: string) {
    super(message);
  }
}

export class HTTPError extends BaseError {
  public error = "HTTPGenericError";

  constructor(
    public statusCode: number,
    text: string,
  ) {
    super(text);
  }
}

export class RequestFormatError extends BaseError {
  public error = "RequestFormatError";
  public statusCode = 406;

  constructor(text: string) {
    super(text);
  }
}

export class UnauthorizedError extends BaseError {
  public error = "UnauthorizedError";
  public statusCode = 401;

  constructor() {
    super("Não autorizado.");
  }
}

export class UploadError extends BaseError {
  public error = "UploadError";

  constructor(
    public statusCode: number,
    public message: string,
  ) {
    super(message);
  }
}

export class ResourceAlreadyExistsError extends BaseError {
  public error = "ResourceAlreadyExistsError";
  public statusCode = 409;

  constructor(resource: string) {
    super(`${capitalizeWord(resource)} já existente.`);
  }
}

export class ResourceNotFoundError extends BaseError {
  public error = "ResourceNotFoundError";
  public statusCode = 400;

  constructor(resource: string) {
    super(`${capitalizeWord(resource)} inexistente.`);
  }
}

export class InvalidCredentialsError extends BaseError {
  public error = "InvalidCredentialsError";
  public statusCode = 401;

  constructor() {
    super("Credenciais inválidas.");
  }
}

export class BadRequestError extends BaseError {
  public error = "BadRequestError";
  public statusCode = 400;

  constructor(public message: string) {
    super(message);
  }
}
