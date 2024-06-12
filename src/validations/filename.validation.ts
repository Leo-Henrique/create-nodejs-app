import { extname } from "path";
import { z } from "zod";

export function filenameValidation(filename: string) {
  const schema = z
    .string()
    .min(1, "Main file name is required.")
    .regex(/^\w+$/gim, "Invalid file name.");

  const parsedFilename = schema.safeParse(
    filename.replace(extname(filename), ""),
  );

  if (parsedFilename.success) return true;

  return parsedFilename.error.errors[0].message;
}
