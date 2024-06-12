// https://github.com/turkerdev/fastify-type-provider-zod/issues/82

import { Class } from "type-fest";
import { z } from "zod";

const getTypeNameFromZodType = (zodType: z.ZodType) => {
  const mapping = {
    string: z.ZodString,
    number: [z.ZodNumber, z.ZodBigInt],
    boolean: z.ZodBoolean,
    object: z.ZodObject,
    array: z.ZodArray,
    undefined: z.ZodUndefined,
    null: z.ZodNull,
  };
  const primitiveTypeNames = Object.keys(mapping);

  for (const primitiveTypeName of primitiveTypeNames) {
    const zodTypeClass = mapping[primitiveTypeName as keyof typeof mapping];

    if (Array.isArray(zodTypeClass)) {
      for (const _zodTypeClass of zodTypeClass) {
        if (zodType instanceof _zodTypeClass) return primitiveTypeName;
      }
    } else if (zodType instanceof zodTypeClass) {
      return primitiveTypeName;
    }
  }

  return "string";
};

const zodTypeContainsInnerType = (
  target: z.ZodType,
  innerType: Class<unknown>,
): boolean => {
  if (target instanceof innerType) return true;

  if ("innerType" in target._def)
    return zodTypeContainsInnerType(
      target._def.innerType as z.ZodType,
      innerType,
    );

  return false;
};

// eslint-disable-next-line
export function handleSwaggerMultipart(schema: Record<string, any>) {
  let isMultipartFormat = false;

  if ("consumes" in schema && schema.consumes.includes("multipart/form-data"))
    isMultipartFormat = true;

  for (const key in schema) {
    if (typeof schema[key] === "object" && schema[key] !== null) {
      if (key === "consumes" && isMultipartFormat) {
        // eslint-disable-next-line
        const fields: Record<string, any> = {};
        const requiredFields = [];

        if (schema.multipartFileFields) {
          for (const multipartFileField of schema.multipartFileFields) {
            fields[multipartFileField] = { type: "file" };
            requiredFields.push(multipartFileField);
          }
        }

        if (schema.multipartAnotherFieldsSchema) {
          for (const multipartAnotherField in schema
            .multipartAnotherFieldsSchema.shape) {
            const zodType =
              schema.multipartAnotherFieldsSchema.shape[multipartAnotherField];

            fields[multipartAnotherField] = {
              type: getTypeNameFromZodType(zodType),
            };

            if (!zodTypeContainsInnerType(zodType, z.ZodOptional))
              requiredFields.push(multipartAnotherField);
          }
        }

        schema.body = {
          type: "object",
          properties: fields,
          required: requiredFields,
        };
      } else {
        handleSwaggerMultipart(schema[key]);
      }
    }
  }

  return schema;
}
