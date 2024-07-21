import { existsSync, mkdirSync, readdirSync } from "fs";
import { resolve } from "path";

if (!process.env.NODE_ENV) {
  if (process.argv[1].endsWith(".js")) {
    process.env.NODE_ENV = "production";
  } else {
    process.env.NODE_ENV = "development";
  }
}

const getPackageJsonUpDir = (dir = __dirname): string => {
  const filenames = readdirSync(dir, { encoding: "utf-8" });

  if (filenames.includes("package.json")) return dir;

  return getPackageJsonUpDir(resolve(dir, ".."));
};

const ROOT_PATH = getPackageJsonUpDir();

export const GENERATED_APP_TARGET_ROOT_PATH =
  process.env.NODE_ENV === "production"
    ? process.cwd()
    : resolve(ROOT_PATH, "generated-apps");

if (
  process.env.NODE_ENV !== "production" &&
  !existsSync(GENERATED_APP_TARGET_ROOT_PATH)
) {
  mkdirSync(GENERATED_APP_TARGET_ROOT_PATH);
}

export const TEMPLATES_PATH = resolve(ROOT_PATH, "templates");

export const CLEAN_TEMPLATE_PATH = resolve(TEMPLATES_PATH, "clean");
