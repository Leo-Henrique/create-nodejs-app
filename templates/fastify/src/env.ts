import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["test", "development", "production"]),
  API_NAME: z.string(),
  API_PORT: z.coerce.number(),
  API_ACCESS_PERMISSION_CLIENT_SIDE: z.string().default("*"),
});

const parsedEnv = schema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
