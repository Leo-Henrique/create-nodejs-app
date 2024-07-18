import { Templates } from "@/core/templates";
import { TEMPLATES_PATH } from "@/config";
import { cp } from "fs/promises";
import { basename, resolve } from "path";

export async function copyTemplateCompose(path: string, template: Templates) {
  const ignore = (path: string, basenames: string[]) => {
    for (const name of basenames) {
      if (basename(path) === name) return true;
    }

    return false;
  };

  await cp(resolve(TEMPLATES_PATH, template), path, {
    recursive: true,
    filter: src => {
      const ignorePaths = [
        "node_modules",
        "pnpm-lock.yaml",
        ".env",
        "dist",
        ".eslintcache",
      ];

      if (ignore(src, ignorePaths)) return false;

      return true;
    },
  });
}
