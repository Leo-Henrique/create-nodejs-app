import { AppModule } from "@/infra/app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("[Controller] Hello", () => {
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

  it("[GET] /hello", async () => {
    const response = await request(app.getHttpServer())
      .get("/hello")
      .query({ show: true });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "Hello world!" });
  });
});
