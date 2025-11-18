import type { SWRConfiguration } from "swr";

export const swrConfig: SWRConfiguration = {
  errorRetryCount: 3,
  errorRetryInterval: 3500,
  shouldRetryOnError: false,
  revalidateOnFocus: false,
};
