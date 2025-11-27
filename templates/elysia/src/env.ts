import packageJson from "@/../package.json";
import { config } from "dotenv";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const envFilesForEachEnvironment = {
  production: ".env",
  development: ".env.development",
  test: ".env.test",
} as const;

if (process.env?.npm_lifecycle_event === "start")
  process.env.NODE_ENV = "production";

if (
  [":dev", "dev:"].some((subcommand) =>
    process.env.npm_lifecycle_event?.includes(subcommand),
  )
)
  process.env.NODE_ENV = "development";

if (
  [":test", "test:"].some((subcommand) =>
    process.env.npm_lifecycle_event?.includes(subcommand),
  )
)
  process.env.NODE_ENV = "test";

const nodeEnvEnum = ["production", "development", "test"] as const;
const nodeEnv = process.env.NODE_ENV as (typeof nodeEnvEnum)[number];
const envFilePath = resolve(process.cwd(), envFilesForEachEnvironment[nodeEnv]);

if (!existsSync(envFilePath))
  throw new Error(
    `Cannot find environment variables file in "${envFilePath}".`,
  );

config({
  path: envFilePath,
  quiet: nodeEnv === "test",
});

const schema = z.object({
  NODE_ENV: z.enum(nodeEnvEnum).default(nodeEnv),
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
  console.error(z.treeifyError(parsedEnv.error).properties);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
