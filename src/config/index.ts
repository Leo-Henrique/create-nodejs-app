import { getPackageJsonUpDir } from "@/utils/get-package-json-up-dir";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const PROJECT_ROOT_PATH = getPackageJsonUpDir();

export const GENERATED_APP_TARGET_ROOT_PATH =
  process.env.NODE_ENV === "production"
    ? process.cwd()
    : resolve(PROJECT_ROOT_PATH, "generated-apps");

export const TEMPLATES_PATH = resolve(PROJECT_ROOT_PATH, "templates");

export const CLEAN_TEMPLATE_PATH = resolve(TEMPLATES_PATH, "clean");

if (
  process.env.NODE_ENV !== "production" &&
  !existsSync(GENERATED_APP_TARGET_ROOT_PATH)
) {
  mkdirSync(GENERATED_APP_TARGET_ROOT_PATH);
}
