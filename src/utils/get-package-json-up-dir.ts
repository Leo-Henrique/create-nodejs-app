import { readdirSync } from "fs";
import { resolve } from "path";

export function getPackageJsonUpDir(dir = __dirname) {
  const filenames = readdirSync(dir, { encoding: "utf-8" });

  if (filenames.includes("package.json")) return dir;

  return getPackageJsonUpDir(resolve(dir, ".."));
}
