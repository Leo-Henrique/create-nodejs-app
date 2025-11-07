import { env } from "@/env";
import { status, type ElysiaCustomStatusResponse } from "elysia";
import z from "zod";

export abstract class BaseError<
  TargetError,
  Name extends string = string,
  StatusCode extends number = number,
  Message extends string = string, // It cannot be undefined because of the native Error type.
  Debug = undefined,
> extends Error {
  public abstract name: Name;
  public abstract statusCode: StatusCode;
  public message!: Message;
  public debug!: Debug;

  private getUnbuildInstance<
    StatusCode extends number,
    Message extends string,
    Debug,
  >() {
    return this as unknown as BaseError<
      TargetError,
      Name,
      StatusCode,
      Message,
      Debug
    >;
  }

  public setStatusCode<const StatusCodeInput extends number>(
    statusCode: StatusCodeInput,
  ) {
    this.statusCode = statusCode as unknown as StatusCode;

    return this.getUnbuildInstance<StatusCodeInput, Message, Debug>();
  }

  public setMessage<const MessageInput extends string>(message: MessageInput) {
    this.message = message as unknown as Message;

    return this.getUnbuildInstance<StatusCode, MessageInput, Debug>();
  }

  public setDebug<const DebugInput>(debug: DebugInput) {
    this.debug = debug as unknown as Debug;

    return this.getUnbuildInstance<StatusCode, Message, DebugInput>();
  }

  public toSerialize() {
    return {
      name: this.name,
      statusCode: this.statusCode,
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
      message: Message;
    }
  > {
    return status(this.statusCode, this.toSerialize());
  }

  public toZodSchema(options?: {
    isNameLiteral?: boolean;
    isStatusCodeLiteral?: boolean;
    isMessageLiteral?: boolean;
  }) {
    const { isNameLiteral, isStatusCodeLiteral, isMessageLiteral } = {
      isNameLiteral: true,
      isStatusCodeLiteral: true,
      isMessageLiteral: true,
      ...options,
    };

    return z.object({
      name: isNameLiteral ? z.literal(this.name) : z.string(),
      statusCode: isStatusCodeLiteral ? z.literal(this.statusCode) : z.number(),
      message: isMessageLiteral ? z.literal(this.message) : z.string(),
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

export class ValidationError extends BaseError<
  ValidationError,
  typeof ValidationError.name,
  typeof ValidationError.statusCode,
  typeof ValidationError.message
> {
  public static readonly name = "VALIDATION_ERROR";
  public static readonly statusCode = 422;
  public static readonly message = "Os dados enviados são inválidos.";

  public readonly name = ValidationError.name;
  public readonly statusCode = ValidationError.statusCode;
  public readonly message = ValidationError.message;
}

export class ResourceNotFoundError extends BaseError<
  ResourceNotFoundError,
  typeof ResourceNotFoundError.name,
  typeof ResourceNotFoundError.statusCode,
  typeof ResourceNotFoundError.message
> {
  public static readonly name = "RESOURCE_NOT_FOUND_ERROR";
  public static readonly statusCode = 404;
  public static readonly message = "Recurso não encontrado.";

  public readonly name = ResourceNotFoundError.name;
  public readonly statusCode = ResourceNotFoundError.statusCode;
  public readonly message = ResourceNotFoundError.message;
}
