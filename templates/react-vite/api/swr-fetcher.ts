import { publicEnv } from "@/public-env";
import { ApiError, ApiUnknownError } from "./errors";

export type SwrFetcherOutput = {
  body: unknown;
  status: number;
  headers: Headers;
};

export async function swrFetcher<Output extends SwrFetcherOutput>(
  endpointUrl: RequestInfo | URL,
  options: RequestInit,
): Promise<Output> {
  const url = getFullUrlFromApiByEndpoint(endpointUrl);
  let response: Response;

  try {
    response = await fetch(url, {
      credentials: "include",
      ...options,
    });
  } catch {
    throw new ApiUnknownError();
  }

  let body: unknown = null;

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

    throw new ApiUnknownError();
  }

  return {
    body,
    status: response.status,
    headers: response.headers,
  } as Awaited<Output>;
}

function getFullUrlFromApiByEndpoint(endpointUrl: RequestInfo | URL) {
  const url = new URL(publicEnv.API_BASE_URL);
  const [pathname, stringifiedSearchParams] = endpointUrl.toString().split("?");

  if (url.pathname.endsWith("/")) {
    url.pathname = pathname;
  } else {
    url.pathname += pathname;
  }

  if (stringifiedSearchParams) {
    const searchParams = new URLSearchParams(stringifiedSearchParams);

    for (const searchParamKey of Array.from(searchParams.keys())) {
      const searchParamValue = searchParams.get(searchParamKey);

      if (searchParamValue)
        url.searchParams.set(searchParamKey, searchParamValue);
    }
  }

  return url;
}
