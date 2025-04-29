import { z } from "zod";

const schema = z.object({
  API_JSON_DOCS_URL: z
    .string()
    .url()
    .transform(url => new URL(url)),
});

const parsedEnv = schema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid private environment variables.");
}

export const privateEnv = parsedEnv.data;
