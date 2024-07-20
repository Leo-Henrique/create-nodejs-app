import { TEMPLATES_PATH } from "@/config";
import { Validation, ValidationResult } from "@/core/validation";
import { toPascalCase } from "@/utils/to-pascal-case";
import { readdir } from "fs/promises";
import validateNpmPackageName from "validate-npm-package-name";

interface TemplateNameValidationParams {
  templateName: string;
}

export class TemplateNameValidation extends Validation<TemplateNameValidationParams> {
  public static create(params: TemplateNameValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    const { templateName } = this.params;

    const alreadyExistingTemplates = await readdir(TEMPLATES_PATH);

    if (alreadyExistingTemplates.includes(templateName))
      return {
        isValid: false,
        issue: `Template with name "${templateName}" already exists.`,
      };

    const npmPackageNameValidation = validateNpmPackageName(templateName);

    if (!npmPackageNameValidation.validForNewPackages)
      return {
        isValid: false,
        issue: toPascalCase(npmPackageNameValidation.errors![0]),
      };

    return { isValid: true };
  }
}
