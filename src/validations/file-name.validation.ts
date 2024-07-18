import { Validation, ValidationResult } from "@/core/validations";
import { extname } from "path";
import { z } from "zod";

interface FileNameValidationParams {
  fileName: string;
}

export class FileNameValidation extends Validation<FileNameValidationParams> {
  public params!: FileNameValidationParams;
  public constructor() {
    super();
  }

  async validate(): Promise<ValidationResult> {
    const { fileName } = this.params;

    const schema = z
      .string()
      .min(1, "Main file name is required.")
      .regex(/^\w+$/gim, "Invalid file name.");

    const parsedFilename = schema.safeParse(
      fileName.replace(extname(fileName), ""),
    );

    if (!parsedFilename.success) {
      return {
        isValid: false,
        issue: parsedFilename.error.errors[0].message,
      };
    }

    return { isValid: true };
  }
}
