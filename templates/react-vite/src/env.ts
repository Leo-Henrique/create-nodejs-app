import { z } from "zod";

const schema = z.object({
  APP_NAME: z.string(),
  APP_API_BASE_URL: z
    .string()
    .url()
    .transform(val => new URL(val).toString()),
});

const parsedEnv = schema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
