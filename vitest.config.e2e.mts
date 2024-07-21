import { mergeConfig } from "vitest/config";
import defaultConfig from "./vitest.config.mjs";

export default mergeConfig(defaultConfig, {
  test: {
    include: ["./**/*.e2e-spec.ts"],
  },
});
