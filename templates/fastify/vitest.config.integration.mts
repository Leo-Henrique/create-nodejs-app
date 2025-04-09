import { mergeConfig } from "vitest/config";
import { controllersFileNameSuffix } from "./src/http/plugins/routes.plugin";
import defaultConfig from "./vitest.config.mjs";

export default mergeConfig(defaultConfig, {
  test: {
    include: [`./src/**/*${controllersFileNameSuffix}.spec.ts`],
    fileParallelism: false,
  },
});
