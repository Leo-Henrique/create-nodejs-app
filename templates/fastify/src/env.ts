import packageJson from "@/../package.json";
import { config } from "dotenv";
import { resolve } from "node:path";
import { z } from "zod";

const envFileNames = {
  production: ".env",
  development: ".env.development",
  test: ".env.test",
} as const;

if (process.env?.npm_lifecycle_event === "start")
  process.env.NODE_ENV = "production";

if (process.env.npm_lifecycle_event?.includes(":dev"))
  process.env.NODE_ENV = "development";

if (process.env.npm_lifecycle_event?.includes(":test"))
  process.env.NODE_ENV = "test";

if (!process.env.NODE_ENV)
  throw new Error("Could not set to the environment variables to use.");

const envFileName =
  envFileNames[process.env.NODE_ENV as keyof typeof envFileNames];

config({
  path: resolve(__dirname, "..", envFileName),
  override: true,
});

const schema = z.object({
  NODE_ENV: z
    .enum(["production", "development", "test"])
    .default(process.env.NODE_ENV as keyof typeof envFileNames),
  API_NAME: z.string().default(packageJson.name),
  API_PORT: z.coerce.number().default(3333),
  API_ACCESS_PERMISSION_CLIENT_SIDE: z.string().default("*"),
});

const parsedEnv = schema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
