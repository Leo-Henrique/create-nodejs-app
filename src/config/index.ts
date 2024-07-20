import appRootPath from "app-root-path";
import { existsSync, mkdirSync } from "fs";
import { resolve } from "path";

if (!process.env.NODE_ENV && process.argv[1].endsWith(".js")) {
  process.env.NODE_ENV = "production";
} else {
  process.env.NODE_ENV = "development";
}

export const GENERATED_APP_TARGET_ROOT_PATH =
  process.env.NODE_ENV === "production"
    ? process.cwd()
    : resolve(appRootPath.path, "generated-apps");

if (
  process.env.NODE_ENV !== "production" &&
  !existsSync(GENERATED_APP_TARGET_ROOT_PATH)
) {
  mkdirSync(GENERATED_APP_TARGET_ROOT_PATH);
}

export const TEMPLATES_PATH = resolve(appRootPath.path, "templates");

export const CLEAN_TEMPLATE_PATH = resolve(TEMPLATES_PATH, "clean");
