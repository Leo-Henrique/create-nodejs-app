import { defineConfig } from "orval";
import { OrvalCustomConfig } from "./scripts/orval-generate-api-definition";

export const orvalCustomConfig: OrvalCustomConfig = {
  apiDocs: {
    outputPath: "./src/api/docs.json",
  },
  endpoints: {
    outputPath: "./src/api/orval/endpoints",
    replaceVoidTypeToAnyOnResponse: true,
  },
  zodSchemas: {
    outputPath: "./src/api/orval/schemas",
  },
};

export default defineConfig({
  api: {
    input: orvalCustomConfig.apiDocs.outputPath,
    output: {
      target: orvalCustomConfig.endpoints.outputPath,
      client: "swr",
      httpClient: "fetch",
      baseUrl: new URL(process.env.APP_API_BASE_URL!).toString(),
      mode: "tags",
      clean: true,
      override: {
        mutator: {
          path: "./src/api/swr-fetcher.ts",
          name: "swrFetcher",
        },
        swr: {
          swrOptions: {
            errorRetryCount: 3,
            errorRetryInterval: 3500,
            revalidateOnFocus: false,
          },
        },
      },
    },
  },
  apiZod: {
    input: orvalCustomConfig.apiDocs.outputPath,
    output: {
      target: orvalCustomConfig.zodSchemas.outputPath,
      client: "zod",
      mode: "tags",
      clean: true,
    },
  },
});
