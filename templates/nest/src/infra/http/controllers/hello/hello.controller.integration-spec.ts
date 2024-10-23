import { AppModule } from "@/infra/app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HelloControllerQuery } from "./hello.controller";

describe("[Controller] GET /hello", () => {
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

  it("should be able to show hello world when setting true in the query parameter", async () => {
    const response = await request(app.getHttpServer())
      .get("/hello")
      .query({ show: true } satisfies HelloControllerQuery);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ message: "Hello world!" });
  });

  it("should not be able to show hello world when setting false in the query parameter", async () => {
    const response = await request(app.getHttpServer())
      .get("/hello")
      .query({ show: false } satisfies HelloControllerQuery);

    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("BAD_REQUEST_ERROR");
  });

  describe("Input data validations", () => {
    it("with invalid show property", async () => {
      const response = await request(app.getHttpServer())
        .get("/hello")
        .query({
          // @ts-expect-error the value must be a boolean
          show: 0,
        } satisfies HelloControllerQuery);

      expect(response.statusCode).toEqual(400);
      expect(response.body.error).toEqual("VALIDATION_ERROR");
    });
  });
});
