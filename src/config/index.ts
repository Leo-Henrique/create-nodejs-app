import { env } from "@/env";
import { resolve } from "path";

const rootPath = resolve(__dirname, "../..");

export const GENERATED_APP_ROOT_PATH =
  env.NODE_ENV === "production"
    ? process.cwd()
    : resolve(rootPath, "generated-apps");

export const TEMPLATES_PATH = resolve(rootPath, "templates");

export const CLEAN_TEMPLATE_PATH = resolve(TEMPLATES_PATH, "clean");
