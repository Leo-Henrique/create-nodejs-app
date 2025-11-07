import { treeifyError, z } from "zod";

const schema = z.object({
  PUBLIC_APP_NAME: z.string(),
  PUBLIC_API_BASE_URL: z.url().transform((url) => new URL(url)),
});

const parsedEnv = schema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  console.error(treeifyError(parsedEnv.error));

  throw new Error("Invalid environment variables.");
}

export const env = parsedEnv.data;
