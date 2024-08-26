import { generateSchema } from "@anatine/zod-openapi";
import { UsePipes, applyDecorators } from "@nestjs/common";
import { ZodType } from "zod";
import {
  ZodValidationPipe,
  ZodValidationPipeSchemas,
} from "./zod-validation-pipe";

import { ApiBody, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { RequireAtLeastOne } from "type-fest";

export function zodSchemaToSwaggerSchema(schema: ZodType) {
  return generateSchema(schema, false, "3.0") as SchemaObject;
}

interface ZodSchemaPipeParams extends ZodValidationPipeSchemas {
  isMultipart?: boolean;
  response?: ZodType | Record<number, ZodType>;
}

type NestSwaggerDecorator =
  | (MethodDecorator & ClassDecorator)
  | MethodDecorator;

export function ZodSchemaPipe({
  isMultipart,
  routeParams,
  queryParams,
  body,
  response,
}: RequireAtLeastOne<ZodSchemaPipeParams>) {
  const apiDecorators: NestSwaggerDecorator[] = [];

  if (routeParams) {
    const routeParamsSchema = zodSchemaToSwaggerSchema(routeParams);

    for (const paramName in routeParams.shape) {
      apiDecorators.push(
        ApiParam({
          name: paramName,
          schema: zodSchemaToSwaggerSchema(routeParams.shape[paramName]),
          required: routeParamsSchema.required?.includes(paramName) ?? false,
        }),
      );
    }
  }

  if (queryParams) {
    const queryParamsSchema = zodSchemaToSwaggerSchema(queryParams);

    for (const paramName in queryParams.shape) {
      apiDecorators.push(
        ApiQuery({
          name: paramName,
          schema: zodSchemaToSwaggerSchema(queryParams.shape[paramName]),
          required: queryParamsSchema.required?.includes(paramName) ?? false,
        }),
      );
    }
  }

  if (body && !isMultipart) {
    apiDecorators.push(ApiBody({ schema: zodSchemaToSwaggerSchema(body) }));
  }

  if (response) {
    if (response instanceof ZodType) {
      apiDecorators.push(
        ApiResponse({ schema: zodSchemaToSwaggerSchema(response) }),
      );
    } else {
      for (const statusCode in response) {
        apiDecorators.push(
          ApiResponse({
            schema: zodSchemaToSwaggerSchema(response[statusCode]),
            status: Number(statusCode),
          }),
        );
      }
    }
  }

  const zodValidationPipe = new ZodValidationPipe({
    routeParams,
    queryParams,
    body,
  });

  return applyDecorators(UsePipes(zodValidationPipe), ...apiDecorators);
}
