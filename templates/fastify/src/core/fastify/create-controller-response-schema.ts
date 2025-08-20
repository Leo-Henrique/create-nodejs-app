import { BaseError } from "@/http/errors";
import { Constructor } from "type-fest";
import { z, ZodType, ZodUnion } from "zod";

type IsUnion<T, U = T> = T extends U ? ([U] extends [T] ? false : true) : never;

type ErrorInstance<
  Errors extends Constructor<BaseError & { schema: ZodType }>[],
  StatusCode,
> = Extract<InstanceType<Errors[number]>, { statusCode: StatusCode }>;

export function createControllerResponseSchema<
  SuccessResponses extends Record<number, ZodType>,
  ErrorClasses extends Constructor<BaseError & { schema: ZodType }>[],
>(
  successResponses: SuccessResponses,
  ...errorClasses: ErrorClasses
): {
  readonly [K in keyof SuccessResponses]: SuccessResponses[K];
} & {
  readonly [K in InstanceType<ErrorClasses[number]>["statusCode"]]: IsUnion<
    ErrorInstance<ErrorClasses, K>
  > extends true
    ? ZodUnion<
        [
          ErrorInstance<ErrorClasses, K>["schema"],
          ...ErrorInstance<ErrorClasses, K>["schema"][],
        ]
      >
    : ErrorInstance<ErrorClasses, K>["schema"];
} {
  const errorInstances = errorClasses
    .map(ErrorClass => {
      return new ErrorClass();
    })
    .filter((errorInstance, index, array) => {
      const prevErrorInstances = array.slice(0, index);
      const errorAlreadyFiltered = prevErrorInstances.some(({ error }) => {
        return error === errorInstance.error;
      });

      return !errorAlreadyFiltered;
    });
  const statusCodes = [
    ...new Set([
      ...Object.keys(successResponses),
      ...errorInstances.map(errorInstance => errorInstance.statusCode),
    ]),
  ].map(statusCode => Number(statusCode));

  return statusCodes.reduce(
    (response, statusCode) => {
      if (successResponses[statusCode]) {
        response[statusCode] = successResponses[statusCode];
        return response;
      }

      const errorInstancesFromStatusCode = errorInstances.filter(
        errorInstance => errorInstance.statusCode === statusCode,
      );
      const errorSchemasFromStatusCode = errorInstancesFromStatusCode.map(
        errorInstance => errorInstance.schema,
      );

      if (errorSchemasFromStatusCode.length > 1) {
        const errorCodes = errorInstancesFromStatusCode
          .map(errorInstance => errorInstance.error)
          .join(" or ");

        response[statusCode] = z
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .union(errorSchemasFromStatusCode as any)
          .describe(errorCodes);
        return response;
      }

      response[statusCode] = errorSchemasFromStatusCode[0];
      return response;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as any,
  );
}
