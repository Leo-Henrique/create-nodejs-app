import { createZodDto } from "@anatine/zod-nestjs";
import { extendApi, generateSchema } from "@anatine/zod-openapi";
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

export function zodSchemaToNestDto(schema: ZodType) {
  return class Dto extends createZodDto(extendApi(schema)) {};
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
    apiDecorators.push(
      ApiParam({ type: zodSchemaToNestDto(routeParams), name: "" }),
    );
  }

  if (queryParams) {
    apiDecorators.push(ApiQuery({ type: zodSchemaToNestDto(queryParams) }));
  }

  if (body && !isMultipart) {
    apiDecorators.push(ApiBody({ type: zodSchemaToNestDto(body) }));
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
