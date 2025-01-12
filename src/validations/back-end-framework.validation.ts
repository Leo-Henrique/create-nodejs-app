import { Validation, ValidationResult } from "@/core/validation";
import { getValidOptionsFromSelect } from "@/utils/get-valid-options-from-prompt";

export const backEndFrameworks = [
  {
    title: "Fastify",
    value: "fastify",
  },
  {
    title: "Nest + SWC",
    value: "nest",
  },
  {
    title: "tRPC",
    value: "trpc",
    disabled: true,
  },
] as const;

export const backEndValidFrameworks =
  getValidOptionsFromSelect(backEndFrameworks);

export type BackEndValidFrameworks = (typeof backEndValidFrameworks)[number];

interface BackEndFrameworkValidationParams {
  framework: string;
}

export class BackEndFrameworkValidation extends Validation<BackEndFrameworkValidationParams> {
  public static create(params: BackEndFrameworkValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    let { framework } = this.params;

    framework = framework.toLowerCase();

    if (!(backEndValidFrameworks as string[]).includes(framework))
      return {
        isValid: false,
        issue: `Invalid back-end framework, consider the options: ${backEndValidFrameworks.map(item => `"${item}"`).join(", ")}.`,
      };

    return { isValid: true };
  }
}
