import { basename, resolve } from "path";

const parentFolder = basename(resolve(__dirname, ".."));

if (parentFolder === "dist") {
  process.env.NODE_ENV = "production";
} else {
  process.env.NODE_ENV = "development";
}

const rootPath = resolve(__dirname, "../..");

export const GENERATED_APP_ROOT_PATH =
  process.env.NODE_ENV === "production"
    ? process.cwd()
    : resolve(rootPath, "generated-apps");

export const TEMPLATES_PATH = resolve(rootPath, "templates");

export const CLEAN_TEMPLATE_PATH = resolve(TEMPLATES_PATH, "clean");
