import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { ZodSchemaPipe } from "../../middlewares/zod-schema-pipe";

export const helloControllerQuerySchema = z.object({
  show: z
    .enum(["true", "false"])
    .default("true")
    .transform<boolean>(val => JSON.parse(val)),
});

type HelloControllerQuery = z.infer<typeof helloControllerQuerySchema>;

const helloControllerResponseSchema = z.object({
  message: z.literal("Hello world!"),
});

type HelloControllerResponse = z.infer<typeof helloControllerResponseSchema>;

@Controller()
export class HelloController {
  @ApiTags("Hello")
  @ApiOperation({ summary: "Hello world!" })
  @Get("/hello")
  @HttpCode(200)
  @ZodSchemaPipe({
    queryParams: helloControllerQuerySchema,
    response: {
      200: helloControllerResponseSchema,
    },
  })
  async handle(
    @Query() query: HelloControllerQuery,
  ): Promise<HelloControllerResponse> {
    const { show } = query;

    if (!show)
      throw new BadRequestException(
        `You don't want to display the "hello world"!`,
      );

    return { message: "Hello world!" };
  }
}
