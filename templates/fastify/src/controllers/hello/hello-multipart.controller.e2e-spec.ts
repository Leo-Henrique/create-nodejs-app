import { app } from "@/app";
import { faker } from "@faker-js/faker";
import { extension } from "mime-types";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("[Controller] Hello", () => {
  it("[POST] /hello/multipart", async () => {
    const imageResponse = await fetch(faker.image.urlLoremFlickr());
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const imageContentType = imageResponse.headers.get("content-type")!;
    const imageExtension = extension(imageContentType) as string;

    const description = faker.lorem.sentence();
    const response = await request(app.server)
      .post("/hello/multipart")
      .attach("attachment", Buffer.from(imageArrayBuffer), {
        contentType: imageContentType,
        filename: faker.system.commonFileName(imageExtension),
      })
      .field({ description });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Hello world!",
        description,
        file: expect.any(Object),
      }),
    );
  });
});
