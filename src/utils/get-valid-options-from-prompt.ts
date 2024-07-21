import { Choice } from "prompts";

type ValidOptions<T extends ReadonlyArray<Choice>> = T[number] & {
  disabled?: false | undefined;
};

export function getValidOptionsFromSelect<T extends ReadonlyArray<Choice>>(
  options: T,
): Array<ValidOptions<T>["value"]> {
  return options.filter(item => !item.disabled).map(({ value }) => value);
}
