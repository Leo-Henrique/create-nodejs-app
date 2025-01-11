import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { generate } from "orval";
import { z } from "zod";
import { orvalCustomConfig } from "../orval.config";

export type OrvalCustomConfig = {
  apiDocs: {
    outputPath: string;
  };
  endpoints: {
    outputPath: string;
    replaceVoidTypeToAnyOnResponse?: boolean;
  };
  zodSchemas: {
    outputPath: string;
  };
};

const envSchemaFromNodeEnvironment = z.object({
  API_JSON_DOCS_URL: z
    .string()
    .url()
    .transform(val => new URL(val).toString()),
});

const parsedEnv = envSchemaFromNodeEnvironment.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

const env = parsedEnv.data;

(async () => {
  const apiJsonDocsResponse = await fetch(env.API_JSON_DOCS_URL);
  const apiJsonDocs = await apiJsonDocsResponse.text();
  const apiJsonDocsDirPath = dirname(orvalCustomConfig.apiDocs.outputPath);

  if (!existsSync(apiJsonDocsDirPath)) await mkdir(apiJsonDocsDirPath);

  await Promise.all([
    rm(orvalCustomConfig.endpoints.outputPath, {
      force: true,
      recursive: true,
    }),
    rm(orvalCustomConfig.zodSchemas.outputPath, {
      force: true,
      recursive: true,
    }),
    writeFile(orvalCustomConfig.apiDocs.outputPath, apiJsonDocs),
  ]);

  await generate("./orval.config.ts");

  const generatedEndpointFiles = await Promise.all(
    (await readdir(orvalCustomConfig.endpoints.outputPath)).map(
      async relativePath => {
        const filePath = resolve(
          orvalCustomConfig.endpoints.outputPath,
          relativePath,
        );

        return {
          filePath,
          fileContent: await readFile(filePath, "utf-8"),
        };
      },
    ),
  );

  await Promise.all(
    generatedEndpointFiles.map(async endpointFile => {
      let newContent = endpointFile.fileContent.replace(/data:/g, "body:");

      if (orvalCustomConfig.endpoints.replaceVoidTypeToAnyOnResponse)
        newContent = newContent.replace(/body: void/g, "body: any");

      await writeFile(endpointFile.filePath, newContent);
    }),
  );

  execSync(
    `pnpm prettier ${orvalCustomConfig.apiDocs.outputPath} ${orvalCustomConfig.endpoints.outputPath} ${orvalCustomConfig.zodSchemas.outputPath} --write`,
  );
})();
