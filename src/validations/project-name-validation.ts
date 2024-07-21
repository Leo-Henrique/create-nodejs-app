import { GENERATED_APP_TARGET_ROOT_PATH } from "@/config";
import { Validation, ValidationResult } from "@/core/validation";
import { toPascalCase } from "@/utils/to-pascal-case";
import { existsSync } from "fs";
import { readdir } from "fs/promises";
import { basename, resolve } from "path";
import validateNpmPackageName from "validate-npm-package-name";

interface ProjectNameValidationParams {
  path: string;
}

export class ProjectNameValidation extends Validation<ProjectNameValidationParams> {
  public static create(params: ProjectNameValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    const { path } = this.params;
    const name = basename(path);
    const targetPath = resolve(GENERATED_APP_TARGET_ROOT_PATH, path);

    if (existsSync(targetPath)) {
      const alreadyExistingFolderNames = await readdir(targetPath);

      if (alreadyExistingFolderNames.includes(name))
        return {
          isValid: false,
          issue: `Folder with name "${name}" already exists in project directory.`,
        };
    }

    const npmPackageNameValidation = validateNpmPackageName(name);

    if (!npmPackageNameValidation.validForNewPackages)
      return {
        isValid: false,
        issue: toPascalCase(npmPackageNameValidation.errors![0]),
      };

    return { isValid: true };
  }
}
