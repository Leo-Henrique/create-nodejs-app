import { TEMPLATES_PATH } from "@/config";
import { Validation, ValidationResult } from "@/core/validation";
import { toPascalCase } from "@/utils/to-pascal-case";
import { readdir } from "fs/promises";
import validateNpmPackageName from "validate-npm-package-name";

interface TemplateNameValidationParams {
  templateName: string;
}

export class TemplateNameValidation extends Validation<TemplateNameValidationParams> {
  public params!: TemplateNameValidationParams;
  public constructor() {
    super();
  }

  async validate(): Promise<ValidationResult> {
    const alreadyExistingTemplates = await readdir(TEMPLATES_PATH);

    if (alreadyExistingTemplates.includes(this.params.templateName))
      return {
        isValid: false,
        issue: `Template with name "${this.params.templateName}" already exists.`,
      };

    const npmPackageNameValidation = validateNpmPackageName(
      this.params.templateName,
    );

    if (!npmPackageNameValidation.validForNewPackages)
      return {
        isValid: false,
        issue: toPascalCase(npmPackageNameValidation.errors![0]),
      };

    return { isValid: true };
  }
}
