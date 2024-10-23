import { AppModule } from "@/infra/app.module";
import { faker } from "@faker-js/faker";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { lookup } from "mime-types";
import { basename, extname } from "path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HelloMultipartControllerBody } from "./hello-multipart.controller";

const SAMPLE_UPLOAD_PATH = "./test/integration/sample-upload.jpg";

describe("[Controller] POST /hello/multipart", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should be able to upload a image", async () => {
    const fieldName = "attachment";
    const description = faker.lorem.sentence();

    const response = await request(app.getHttpServer())
      .post("/hello/multipart")
      .attach(fieldName, SAMPLE_UPLOAD_PATH)
      .field({ description } satisfies HelloMultipartControllerBody);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Hello world!",
        description,
        file: expect.objectContaining({
          fieldname: fieldName,
          originalname: basename(SAMPLE_UPLOAD_PATH),
          mimetype: lookup(extname(SAMPLE_UPLOAD_PATH)),
          size: expect.any(Number),
        }),
      }),
    );
  });
});
