import { defineConfig } from "orval";
import { OrvalCustomConfig } from "./scripts/orval-generate-api-definition";

export const orvalCustomConfig: OrvalCustomConfig = {
  apiDocs: {
    outputPath: "./api/docs.json",
  },
  endpoints: {
    outputPath: "./api/orval/endpoints",
    replaceVoidTypeToAnyOnResponse: false,
  },
  zodSchemas: {
    outputPath: "./api/orval/schemas",
  },
};

export default defineConfig({
  api: {
    input: orvalCustomConfig.apiDocs.outputPath,
    output: {
      target: orvalCustomConfig.endpoints.outputPath,
      client: "swr",
      httpClient: "fetch",
      mode: "tags",
      clean: true,
      override: {
        mutator: {
          path: "./api/swr-fetcher.ts",
          name: "swrFetcher",
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
