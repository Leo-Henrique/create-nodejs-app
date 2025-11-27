import { env } from "@/env";
import { status, type ElysiaCustomStatusResponse } from "elysia";
import z from "zod";

export abstract class BaseError<
  TargetError,
  Name extends string = string,
  StatusCode extends number = number,
  Message extends string = string, // It cannot be undefined because of the native Error type.
  Code extends string | null = null,
  Debug = undefined,
> extends Error {
  public abstract name: Name;
  public abstract statusCode: StatusCode;
  public message!: Message;
  public code!: Code;
  public debug!: Debug;

  // biome-ignore lint/complexity/noUselessConstructor: this is necessary to prevent arguments when instantiating.
  public constructor() {
    super();
  }

  private getUnbuildInstance<
    Message extends string,
    Code extends string | null,
    Debug,
  >() {
    return this as unknown as BaseError<
      TargetError,
      Name,
      StatusCode,
      Message,
      Code,
      Debug
    >;
  }

  public setCode<const CodeInput extends string>(code: CodeInput) {
    this.code = code as unknown as Code;

    return this.getUnbuildInstance<Message, CodeInput, Debug>();
  }

  public setMessage<const MessageInput extends string>(message: MessageInput) {
    this.message = message as unknown as Message;

    return this.getUnbuildInstance<MessageInput, Code, Debug>();
  }

  public setDebug<const DebugInput>(debug: DebugInput) {
    this.debug = debug as unknown as Debug;

    return this.getUnbuildInstance<Message, Code, DebugInput>();
  }

  public toSerialize() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      ...(env.NODE_ENV !== "production" &&
        this.debug && {
          debug: this.debug,
        }),
    };
  }

  public toController(): ElysiaCustomStatusResponse<
    StatusCode,
    {
      name: Name;
      statusCode: StatusCode;
      code: Code;
      message: Message;
      debug?: unknown;
    }
  > {
    return status(this.statusCode, this.toSerialize());
  }

  public toZodSchema(
    { nonLiteral }: { nonLiteral: ("code" | "message")[] } = { nonLiteral: [] },
  ) {
    const getCodeSchema = () => {
      if (nonLiteral.includes("code")) return z.string();

      if (this.code) return z.literal(this.code);

      return z.null();
    };

    return z.object({
      name: z.literal(this.name),
      statusCode: z.literal(this.statusCode),
      code: getCodeSchema(),
      message: nonLiteral.includes("message")
        ? z.string()
        : z.literal(this.message),
    });
  }
}

export class InternalServerError extends BaseError<
  InternalServerError,
  typeof InternalServerError.name,
  typeof InternalServerError.statusCode,
  typeof InternalServerError.message
> {
  public static readonly name = "INTERNAL_SERVER_ERROR";
  public static readonly statusCode = 500;
  public static readonly message =
    "Desculpe, um erro inesperado ocorreu. Tente novamente em alguns minutos ou nos contate.";

  public readonly name = InternalServerError.name;
  public readonly statusCode = InternalServerError.statusCode;
  public readonly message = InternalServerError.message;
}

export class BadRequestError extends BaseError<
  BadRequestError,
  typeof BadRequestError.name,
  typeof BadRequestError.statusCode
> {
  public static readonly name = "BAD_REQUEST_ERROR";
  public static readonly statusCode = 400;

  public readonly name = BadRequestError.name;
  public readonly statusCode = BadRequestError.statusCode;
}

export class UnprocessableEntityError extends BaseError<
  UnprocessableEntityError,
  typeof UnprocessableEntityError.name,
  typeof UnprocessableEntityError.statusCode,
  typeof UnprocessableEntityError.message
> {
  public static readonly name = "UNPROCESSABLE_ENTITY";
  public static readonly statusCode = 422;
  public static readonly message = "Os dados enviados são inválidos.";

  public readonly name = UnprocessableEntityError.name;
  public readonly statusCode = UnprocessableEntityError.statusCode;
  public readonly message = UnprocessableEntityError.message;
}

export class NotFoundError extends BaseError<
  NotFoundError,
  typeof NotFoundError.name,
  typeof NotFoundError.statusCode,
  typeof NotFoundError.message
> {
  public static readonly name = "NOT_FOUND";
  public static readonly statusCode = 404;
  public static readonly message = "Recurso não encontrado.";

  public readonly name = NotFoundError.name;
  public readonly statusCode = NotFoundError.statusCode;
  public readonly message = NotFoundError.message;
}

export class ConflictError extends BaseError<
  ConflictError,
  typeof ConflictError.name,
  typeof ConflictError.statusCode
> {
  public static readonly name = "CONFLICT";
  public static readonly statusCode = 409;

  public readonly name = ConflictError.name;
  public readonly statusCode = ConflictError.statusCode;
}

export class ForbiddenError extends BaseError<
  ForbiddenError,
  typeof ForbiddenError.name,
  typeof ForbiddenError.statusCode,
  typeof ForbiddenError.message
> {
  public static readonly name = "FORBIDDEN";
  public static readonly statusCode = 403;
  public static readonly message = "Acesso negado.";

  public readonly name = ForbiddenError.name;
  public readonly statusCode = ForbiddenError.statusCode;
  public readonly message = ForbiddenError.message;
}

export class UnauthorizedError extends BaseError<
  UnauthorizedError,
  typeof UnauthorizedError.name,
  typeof UnauthorizedError.statusCode,
  typeof UnauthorizedError.message
> {
  public static readonly name = "UNAUTHORIZED";
  public static readonly statusCode = 401;
  public static readonly message = "Não autorizado.";

  public readonly name = UnauthorizedError.name;
  public readonly statusCode = UnauthorizedError.statusCode;
  public readonly message = UnauthorizedError.message;
}
