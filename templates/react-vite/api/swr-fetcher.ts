import { publicEnv } from "@/public-env";
import { ApiError, ApiUnexpectedResponseError } from "./errors";

type SwrFetcherOutput = {
  body: unknown;
  status: number;
  headers: Headers;
};

export async function swrFetcher<Output extends SwrFetcherOutput>(
  endpointUrl: RequestInfo | URL,
  options: RequestInit,
): Promise<Output> {
  const url = new URL(publicEnv.API_BASE_URL);

  if (url.pathname.endsWith("/")) {
    url.pathname = endpointUrl.toString();
  } else {
    url.pathname += endpointUrl;
  }

  const response = await fetch(endpointUrl, options);
  let body: unknown;

  if (
    response.headers.get("Content-Type")?.includes("application/json") &&
    response.status !== 204
  ) {
    try {
      body = await response.json();
    } catch {
      body = null;
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
