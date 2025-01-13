import { env } from "@/env";
import { ApiError } from "./errors/api-error";
import { ApiUnexpectedResponseError } from "./errors/api-unexpected-response-error";

type SwrFetcherOutput = {
  body: unknown;
  status: number;
  headers: Headers;
};

export async function swrFetcher<Output extends SwrFetcherOutput>(
  url: RequestInfo | URL,
  options?: RequestInit,
): Promise<Output> {


  const response = await fetch(endpointUrl, options);
  let body: unknown;

  if (
    response.headers.get("Content-Type")?.includes("application/json") &&
    response.status !== 204
  ) {
    try {
      body = await response.json();
    } catch {
      body = {};
    }
  }

  if (!response.ok) {
    const error = body as ApiError | null;

    if (error) throw new ApiError(error.statusCode, error.error, error.message);

    throw new ApiUnexpectedResponseError();
  }

  return {
    body,
    status: response.status,
    headers: response.headers,
  } as Awaited<Output>;
}
