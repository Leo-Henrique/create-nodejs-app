import { FastifyInstance } from "fastify";
import { readdir } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

const controllersFolderPath = resolve(__dirname, "../controllers");
export const controllersFileNameSuffix = ".controller";

export async function routesPlugin(app: FastifyInstance) {
  const controllers = await Promise.all(
    (
      await readdir(controllersFolderPath, {
        encoding: "utf-8",
        recursive: true,
      })
    )
      .filter(relativePath => {
        const fileNameWithoutExtension = relativePath.replace(
          extname(relativePath),
          "",
        );

        return fileNameWithoutExtension.endsWith(controllersFileNameSuffix);
      })
      .map(async controllerRelativePath => {
        const controllerAbsolutePath = resolve(
          controllersFolderPath,
          controllerRelativePath,
        );

        return {
          pathFromSrc: `src${controllerAbsolutePath.split("src")[1]}`,
          fileName: basename(controllerRelativePath),
          imports: await import(controllerAbsolutePath),
        };
      }),
  );

  for (const controller of controllers) {
    if (!controller.imports.default) {
      throw new Error(
        `The controller file in "${controller.pathFromSrc}" does not have default export.`,
      );
    }

    if (typeof controller.imports.default !== "function") {
      throw new Error(
        `The default export of controller file in "${controller.pathFromSrc}" is not a function.`,
      );
    }

    app.register(controller.imports.default);
  }
}
