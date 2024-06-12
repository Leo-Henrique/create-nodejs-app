import { toPascalCase } from "@/utils/to-pascal-case";
import validateProjectName from "validate-npm-package-name";

export function packageNameValidation(name: string) {
  const validation = validateProjectName(name);

  if (validation.validForNewPackages) return true;

  return toPascalCase(validation.errors![0]);
}
