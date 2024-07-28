import { ValidationError } from "@/core/errors/errors";
import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { ZodError, ZodType } from "zod";

export interface ZodValidationPipeSchemas {
  routeParams?: ZodType;
  queryParams?: ZodType;
  body?: ZodType;
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private schemas: ZodValidationPipeSchemas) {}

  transform(value: unknown, { type }: ArgumentMetadata) {
    try {
      const mappedSchema = {
        param: this.schemas.routeParams,
        query: this.schemas.queryParams,
        body: this.schemas.body,
      };
      const schema = mappedSchema[type as keyof typeof mappedSchema];

      if (schema) return schema.parse(value);

      return value;
    } catch (error) {
      if (error instanceof ZodError)
        throw new ValidationError(error.flatten().fieldErrors);

      throw new ValidationError();
    }
  }
}
