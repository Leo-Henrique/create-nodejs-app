import { left } from "@/utils/left";

export type ValidationResult =
  | {
      isValid: true;
    }
  | { isValid: false; issue: string };

export abstract class Validation<Params = object> {
  abstract params?: Params;
  abstract validate(): Promise<ValidationResult>;

  public async fromCli(params?: Params) {
    if (params) this.params = params;

    const result = await this.validate();

    if (!result.isValid) return left(result.issue);
  }

  public async fromPrompt(params?: Params) {
    if (params) this.params = params;

    const result = await this.validate();

    if (result.isValid) return true;

    return result.issue;
  }
}
