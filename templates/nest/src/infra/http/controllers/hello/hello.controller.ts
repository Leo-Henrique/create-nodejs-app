import { Controller, Get, HttpCode, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { BadRequestError } from "../../errors/bad-request.error";
import { ZodSchemaPipe } from "../../middlewares/zod-schema-pipe";

export const helloControllerQuerySchema = z.object({
  show: z
    .enum(["true", "false"])
    .default("true")
    .transform<boolean>(val => JSON.parse(val)),
});

const helloControllerResponseSchema = z.object({
  message: z.literal("Hello world!"),
});

export type HelloControllerQuery = z.infer<typeof helloControllerQuerySchema>;

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
      throw new BadRequestError(`You don't want to display the "hello world"!`);

    return { message: "Hello world!" };
  }
}
