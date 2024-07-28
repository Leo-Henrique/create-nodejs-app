import { Body, Controller, HttpCode, Post, UploadedFile } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { File } from "fastify-multer/lib/interfaces";
import { z } from "zod";
import { UploadInterceptor } from "../../middlewares/upload-interceptor";
import { ZodSchemaPipe } from "../../middlewares/zod-schema-pipe";

const helloMultipartControllerBodySchema = z.object({
  description: z.string().min(2),
});

type HelloMultipartControllerBody = z.infer<
  typeof helloMultipartControllerBodySchema
>;

const helloMultipartControllerResponseSchema = z.object({
  message: z.literal("Hello world!"),
  description: z.string().min(2),
  file: z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string(),
    size: z.number().optional(),
  }),
});

type HelloMultipartControllerResponse = z.infer<
  typeof helloMultipartControllerResponseSchema
>;

@Controller()
export class HelloMultipartController {
  @ApiTags("Hello")
  @ApiOperation({
    summary: "Hello world with multipart/form-data content-type!",
  })
  @Post("/hello/multipart")
  @HttpCode(200)
  @UploadInterceptor({
    fieldName: "attachment",
    storage: "memory",
    allowedExtensions: ["jpeg", "png", "webp"],
    maxFileSize: 10, // 10MB
    nonFileFieldsZodSchema: helloMultipartControllerBodySchema,
  })
  @ZodSchemaPipe({
    isMultipart: true,
    body: helloMultipartControllerBodySchema,
    response: {
      200: helloMultipartControllerResponseSchema,
    },
  })
  async handle(
    @UploadedFile()
    file: File,
    @Body()
    body: HelloMultipartControllerBody,
  ): Promise<HelloMultipartControllerResponse> {
    const { fieldname, originalname, encoding, mimetype, size } = file;
    const { description } = body;

    return {
      message: "Hello world!",
      description,
      file: {
        fieldname,
        originalname,
        encoding,
        mimetype,
        size,
      },
    };
  }
}
