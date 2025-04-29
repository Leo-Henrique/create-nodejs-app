import { z } from "zod";

type PublicEnvironmentVariables = {
  PUBLIC_APP_NAME: string;
  PUBLIC_API_BASE_URL: string;
};

const publicEnvironmentVariables = import.meta.env as ImportMetaEnv &
  PublicEnvironmentVariables;

const schema = z.object({
  APP_NAME: z.string(),
  API_BASE_URL: z
    .string()
    .url()
    .transform(url => new URL(url)),
});

const parsedEnv = schema.safeParse({
  APP_NAME: publicEnvironmentVariables.PUBLIC_APP_NAME,
  API_BASE_URL: publicEnvironmentVariables.PUBLIC_API_BASE_URL,
});

if (!parsedEnv.success) {
  console.error(parsedEnv.error.flatten().fieldErrors);

  throw new Error("Invalid public environment variables.");
}

export const publicEnv = parsedEnv.data;
