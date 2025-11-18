import { env } from "@/env";
import { ApiError, ApiUnknownError } from "./errors";

export type RequestConfig<Input = unknown> = {
  url: string;
  method: "GET" | "PUT" | "PATCH" | "POST" | "DELETE";
  params?: object;
  data?: Input | FormData;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export type ResponseConfig<Output = unknown> = {
  body: Output;
  response: Response;
};

export type ResponseErrorConfig<Error> = Error;

async function swrFetcher<Output, _Error = unknown, Input = unknown>(
  config: RequestConfig<Input>,
): Promise<ResponseConfig<Output>> {
  const url = getFullApiUrlByEndpointUrl(config.url, config.params);
  let response: Response;

  try {
    response = await fetch(url, {
      credentials: "include",
      method: config.method,
      headers: config.headers,
      signal: config.signal,
      body: config.data as FormData,
      ...(!(config.data instanceof FormData) && {
        body: JSON.stringify(config.data),
        headers: {
          ...config.headers,
          "content-type": "application/json",
        },
      }),
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

    if (error) throw new ApiError(error);

    throw new ApiUnknownError();
  }

  return {
    body: body as Output,
    response,
  };
}

function getFullApiUrlByEndpointUrl(endpointUrl: string, queryParams?: object) {
  const url = new URL(env.PUBLIC_API_BASE_URL);

  if (url.pathname.endsWith("/")) {
    url.pathname = endpointUrl;
  } else {
    url.pathname += endpointUrl;
  }

  if (queryParams) {
    for (const queryParamKey of Object.keys(queryParams)) {
      const searchParamValue =
        queryParams[queryParamKey as keyof typeof queryParams];

      if (searchParamValue)
        url.searchParams.set(queryParamKey, searchParamValue);
    }
  }

  return url;
}

export default swrFetcher;
