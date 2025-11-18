import { defineConfig } from "@kubb/core";
import { pluginOas, type Options } from "@kubb/plugin-oas";
import { pluginSwr } from "@kubb/plugin-swr";
import { pluginTs } from "@kubb/plugin-ts";
import { pluginZod } from "@kubb/plugin-zod";

const pluginsGlobalOptions = {
  group: {
    type: "tag",
    name: ({ group }) => group.replace(/\s/g, "-").toLowerCase(),
  },
} satisfies Options;

export default defineConfig(() => {
  return {
    root: ".",
    input: {
      path: "http://localhost:3333/openapi/json",
    },
    output: {
      path: "./src/api/generated",
      clean: true,
      format: "biome",
      lint: "biome",
    },
    plugins: [
      pluginOas(),
      pluginTs({
        ...pluginsGlobalOptions,
      }),
      pluginZod({
        ...pluginsGlobalOptions,
      }),
      pluginSwr({
        ...pluginsGlobalOptions,
        client: {
          importPath: "@/api/swr-fetcher.ts",
          dataReturnType: "full",
        },
      }),
    ],
  };
});
