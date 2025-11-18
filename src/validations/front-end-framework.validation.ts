import { Validation, ValidationResult } from "@/core/validation";
import { getValidOptionsFromSelect } from "@/utils/get-valid-options-from-prompt";

export const frontEndFrameworks = [
  {
    title:
      "React + Vite (includes: React Router v7 Declarative, SWR + Orval, React Hook Form + Zod)",
    value: "react-vite",
  },
  {
    title:
      "React + Vite (includes: Tanstack Router, SWR + Kubb, React Hook Form + Zod v4)",
    value: "react-vite-tanstack-router",
  },
  {
    title: "Next.js",
    value: "next",
    disabled: true,
  },
] as const;

export const frontEndValidFrameworks =
  getValidOptionsFromSelect(frontEndFrameworks);

export type FrontEndValidFrameworks = (typeof frontEndValidFrameworks)[number];

interface FrontEndFrameworkValidationParams {
  framework: string;
}

export class FrontEndFrameworkValidation extends Validation<FrontEndFrameworkValidationParams> {
  public static create(params: FrontEndFrameworkValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    let { framework } = this.params;

    framework = framework.toLowerCase();

    if (!(frontEndValidFrameworks as string[]).includes(framework))
      return {
        isValid: false,
        issue: `Invalid front-end framework, consider the options: ${frontEndValidFrameworks.map(item => `"${item}"`).join(", ")}.`,
      };

    return { isValid: true };
  }
}
