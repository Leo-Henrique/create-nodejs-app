import { env } from "@/env";
import { resolve } from "path";

const srcPath = resolve(__dirname, "..");

export const GENERATED_APP_ROOT_PATH =
  env.NODE_ENV === "production"
    ? process.cwd()
    : resolve(srcPath, "generated-apps");

export const TEMPLATES_PATH = resolve(srcPath, "templates");

export const CLEAN_TEMPLATE_PATH = resolve(TEMPLATES_PATH, "clean");
