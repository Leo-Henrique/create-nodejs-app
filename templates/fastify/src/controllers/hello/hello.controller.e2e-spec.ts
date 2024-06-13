import { app } from "@/app";
import request from "supertest";
import { describe, expect, it } from "vitest";

describe("[Controller] Hello", () => {
  it("[GET] /hello", async () => {
    const response = await request(app.server)
      .get("/hello")
      .query({ show: true });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ message: "Hello world!" });
  });
});
