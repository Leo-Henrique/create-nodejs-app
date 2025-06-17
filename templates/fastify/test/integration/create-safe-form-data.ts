type CreateSafeFormDataInput = Record<string, string | Blob>;

export type CreateSafeFormDataOutput<Input extends CreateSafeFormDataInput> =
  ReturnType<typeof createSafeFormData<Input>>;

export function createSafeFormData<Input extends CreateSafeFormDataInput>(
  input: Input,
) {
  const formData = new FormData();

  for (const inputProperty in input)
    formData.set(inputProperty, input[inputProperty]);

  return {
    input,
    formData,
  };
}
