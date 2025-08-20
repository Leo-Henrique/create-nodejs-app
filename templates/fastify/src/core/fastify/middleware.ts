import { BaseError } from "@/http/errors";
import { Constructor } from "type-fest";

export type MiddlewareHandlerOutput<
  Errors extends ReadonlyArray<Constructor<BaseError>>,
> = Promise<MiddlewareLeft<InstanceType<Errors[number]>> | void>;

export const middleware = Object.freeze({
  left,
} as const);

class MiddlewareLeft<Error extends BaseError> {
  public constructor(public readonly error: Error) {
    throw error;
  }
}

function left<Error extends BaseError>(error: Error) {
  return new MiddlewareLeft<Error>(error);
}
