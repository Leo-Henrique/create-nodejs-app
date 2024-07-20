import { Validation, ValidationResult } from "@/core/validation";
import { getValidOptionsFromSelect } from "@/utils/get-valid-options-from-prompt";

export const templates = [
  {
    title: "Clean",
    value: "clean",
  },
  {
    title: "API",
    value: "api",
  },
] as const;

export const validTemplates = getValidOptionsFromSelect(templates);

export type ValidTemplates = (typeof validTemplates)[number];

interface TemplateValidationParams {
  template: ValidTemplates;
}

export class TemplateValidation extends Validation<TemplateValidationParams> {
  public static create(params: TemplateValidationParams) {
    return new this().createValidation(params);
  }

  async validate(): Promise<ValidationResult> {
    let { template } = this.params;

    template = template.toLowerCase() as ValidTemplates;

    if (!validTemplates.includes(template))
      return {
        isValid: false,
        issue: `Invalid template, consider the options: ${validTemplates.map(item => `"${item}"`).join(", ")}.`,
      };

    return { isValid: true };
  }
}
