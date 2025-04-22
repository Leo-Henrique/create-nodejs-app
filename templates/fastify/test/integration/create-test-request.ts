import { app } from "@/http/app";
import { InjectOptions } from "fastify";
import { Merge, SetRequired } from "type-fest";

export function createTestRequest<Params extends InjectOptions>(
  defaultParams: SetRequired<
    Partial<Merge<InjectOptions, Params>>,
    "method" | "url"
  >,
) {
  return async (params: Merge<InjectOptions, Params>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { body, json, ...restResult } = await app.inject({
      ...(defaultParams as object),
      ...params,
    });
    let resultBody: unknown;

    try {
      resultBody = json();
    } catch {
      resultBody = null;
    }

    return {
      ...restResult,
      body: resultBody,
    };
  };
}
