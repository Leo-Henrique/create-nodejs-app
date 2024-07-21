import { Validation, ValidationResult } from "@/core/validation";
import { getValidOptionsFromSelect } from "@/utils/get-valid-options-from-prompt";

export const frameworks = [
  {
    title: "Fastify",
    value: "fastify",
  },
  {
    title: "Nest",
    value: "nest",
    disabled: true,
  },
  {
    title: "tRPC",
    value: "trpc",
    disabled: true,
  },
] as const;

export const validFrameworks = getValidOptionsFromSelect(frameworks);

export type ValidFrameworks = (typeof validFrameworks)[number];

interface FrameworkValidationParams {
  framework: ValidFrameworks;
}

export class FrameworkValidation extends Validation<FrameworkValidationParams> {
  public static create(params: FrameworkValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    let { framework } = this.params;

    framework = framework.toLowerCase() as ValidFrameworks;

    if (!validFrameworks.includes(framework))
      return {
        isValid: false,
        issue: `Invalid framework, consider the options: ${validFrameworks.map(item => `"${item}"`).join(", ")}.`,
      };

    return { isValid: true };
  }
}
