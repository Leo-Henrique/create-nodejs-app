import { left } from "@/utils/left";

export type ValidationResult =
  | {
      isValid: true;
    }
  | { isValid: false; issue: string };

export type ValidationData = ReturnType<Validation["createValidation"]>;

export abstract class Validation<Params = unknown> {
  protected params!: Params;

  abstract validate(): Promise<ValidationResult>;

  protected createValidation(params?: Params) {
    if (params) this.params = params;

    return this as unknown as Omit<this, "validate">;
  }

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
