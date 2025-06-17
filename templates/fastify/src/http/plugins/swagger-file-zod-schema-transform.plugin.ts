import { FastifyDynamicSwaggerOptions } from "@fastify/swagger";
import { jsonSchemaTransform } from "fastify-type-provider-zod";
import { ZodArray, ZodObject } from "zod";
import { MULTIPART_FORM_DATA_FILE_SCHEMA_DESCRIPTION } from "./multipart-form-data.plugin";

type RouteData = Parameters<
  NonNullable<FastifyDynamicSwaggerOptions["transform"]>
>[0];

type JsonSchema = ReturnType<typeof jsonSchemaTransform>;

export function swaggerFileZodSchemaTransformPlugin(
  routeData: RouteData,
  jsonSchema: JsonSchema,
) {
  if (
    routeData.schema.consumes?.includes("multipart/form-data") &&
    routeData.schema.body instanceof ZodObject
  ) {
    for (const bodyFieldName in routeData.schema.body.shape) {
      const bodyFieldSchema = routeData.schema.body.shape[bodyFieldName];

      if (
        bodyFieldSchema._def.description ===
        MULTIPART_FORM_DATA_FILE_SCHEMA_DESCRIPTION
      ) {
        jsonSchema.schema.body.properties[bodyFieldName] = {
          type: "string",
          format: "binary",
        };
      }

      if (
        bodyFieldSchema instanceof ZodArray &&
        bodyFieldSchema._def.type._def.description ===
          MULTIPART_FORM_DATA_FILE_SCHEMA_DESCRIPTION
      ) {
        jsonSchema.schema.body.properties[bodyFieldName] = {
          type: "array",
          items: { type: "string", format: "binary" },
        };
      }
    }
  }
}
