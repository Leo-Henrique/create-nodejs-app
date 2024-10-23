import { app } from "@/infra/http/app";
import { faker } from "@faker-js/faker";
import { lookup } from "mime-types";
import { basename, extname } from "path";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { HelloMultipartControllerBody } from "./hello-multipart.controller";

const SAMPLE_UPLOAD_PATH = "./test/integration/sample-upload.jpg";

describe("[Controller] POST /hello/multipart", () => {
  it("should be able to upload a image", async () => {
    const fieldName = "attachment";
    const description = faker.lorem.sentence();

    const response = await request(app.server)
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
