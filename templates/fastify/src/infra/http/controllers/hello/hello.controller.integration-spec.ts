import { app } from "@/infra/http/app";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { HelloControllerQuery } from "./hello.controller";

describe("[Controller] GET /hello", () => {
  it("should be able to show hello world when setting true in the query parameter", async () => {
    const response = await request(app.server)
      .get("/hello")
      .query({ show: true } satisfies HelloControllerQuery);

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ message: "Hello world!" });
  });

  it("should not be able to show hello world when setting false in the query parameter", async () => {
    const response = await request(app.server)
      .get("/hello")
      .query({ show: false } satisfies HelloControllerQuery);

    expect(response.statusCode).toEqual(400);
    expect(response.body.error).toEqual("BAD_REQUEST_ERROR");
  });

  describe("Input data validations", () => {
    it("with invalid show property", async () => {
      const response = await request(app.server)
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
