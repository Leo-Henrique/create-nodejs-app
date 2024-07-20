import { Validation, ValidationResult } from "@/core/validation";
import { getValidOptionsFromSelect } from "@/utils/get-valid-options-from-prompt";

export const packageManagers = [
  {
    title: "NPM",
    value: "npm",
  },
  {
    title: "Yarn",
    value: "yarn",
  },
  {
    title: "PNPM",
    value: "pnpm",
  },
] as const;

export const validPackageManagers = getValidOptionsFromSelect(packageManagers);

export type ValidPackageManagers = (typeof validPackageManagers)[number];

interface PackageManagerValidationParams {
  packageManager: ValidPackageManagers;
}

export class PackageManagerValidation extends Validation<PackageManagerValidationParams> {
  public static create(params: PackageManagerValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    let { packageManager } = this.params;

    packageManager = packageManager.toLowerCase() as ValidPackageManagers;

    if (!validPackageManagers.includes(packageManager))
      return {
        isValid: false,
        issue: `Invalid package manager, consider the options: ${validPackageManagers.map(item => `"${item}"`).join(", ")}.`,
      };

    return { isValid: true };
  }
}
