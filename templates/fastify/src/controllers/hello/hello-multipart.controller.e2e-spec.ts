import { app } from "@/app";
import { faker } from "@faker-js/faker";
import { lookup } from "mime-types";
import { basename, extname } from "path";
import request from "supertest";
import { describe, expect, it } from "vitest";

const SAMPLE_UPLOAD_PATH = "./test/e2e/sample-upload.jpg";

describe("[Controller] Hello multipart", () => {
  it("[POST] /hello/multipart", async () => {
    const fieldName = "attachment";
    const description = faker.lorem.sentence();

    const response = await request(app.server)
      .post("/hello/multipart")
      .attach(fieldName, SAMPLE_UPLOAD_PATH)
      .field({ description });

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
