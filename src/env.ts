import { config } from "dotenv";
import { basename, resolve } from "path";
import { z } from "zod";

const envFilePath = resolve(__dirname, "../.env");
const productionEnvFilePath = resolve(__dirname, "../.env.production");

config({
  path: basename(__dirname) === "dist" ? productionEnvFilePath : envFilePath,
});

const schema = z.object({
  NODE_ENV: z.enum(["test", "development", "production"]),
  APP_NAME: z.string(),
});

const parsedEnv = schema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
