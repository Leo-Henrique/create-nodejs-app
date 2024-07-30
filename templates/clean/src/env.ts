import packageJson from "@/../package.json";
import { config } from "dotenv";
import { z } from "zod";

config({ override: true });

const schema = z.object({
  NODE_ENV: z.enum(["test", "development", "production"]),
  APP_NAME: z.string().default(packageJson.name),
});

const parsedEnv = schema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
