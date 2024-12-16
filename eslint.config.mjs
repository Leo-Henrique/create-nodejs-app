import eslint from "@eslint/js";
import vitestEslint from "@vitest/eslint-plugin";
import prettierEslint from "eslint-config-prettier";
import globals from "globals";
import typescriptEslint from "typescript-eslint";

export default typescriptEslint.config(
  {
    ignores: ["dist"],
  },
  {
    extends: [
      eslint.configs.recommended,
      ...typescriptEslint.configs.recommended,
      prettierEslint,
      vitestEslint.configs.recommended,
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
);
