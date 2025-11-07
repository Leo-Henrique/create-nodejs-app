import packageJson from "@/../package.json";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const nodeEnv = ["production", "development", "test"] as const;

const schema = z.object({
  NODE_ENV: z
    .enum(nodeEnv)
    .default(process.env.NODE_ENV as (typeof nodeEnv)[number]),
  API_NAME: z.string().default(packageJson.name),
  API_PORT: z.coerce.number().default(3333),
  API_CORS_ALLOW_ORIGIN: z.string().default("*"),
  TMP_FILES_PATH: z
    .string()
    .default("./tmp")
    .transform((pathFromSrc) => {
      const tmpPath = resolve(__dirname, "..", pathFromSrc);

      if (!existsSync(tmpPath)) mkdirSync(tmpPath);

      return tmpPath;
    }),
});

const parsedEnv = schema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
