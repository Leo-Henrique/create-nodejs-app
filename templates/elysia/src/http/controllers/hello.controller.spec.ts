import { apiTestClient } from "test/integration/api-test-client";
import { describe, expect, test } from "vitest";
import { UnprocessableEntityError } from "../errors";
import { helloController } from "./hello.controller";

const [route] = helloController.routes;
const sut = apiTestClient.hello.get;

describe(`[Controller] ${route.method} ${route.path}`, () => {
  describe("should not be able to get hello world", () => {
    describe("if invalid input", () => {
      const error = new UnprocessableEntityError().setCode("VALIDATION");

      test("with invalid property show", async () => {
        const result = await sut({
          query: {
            // @ts-expect-error the value must be a string
            show: 0,
          },
        });

        expect(result.status).toEqual(error.statusCode);
        expect(result.error).toMatchObject({
          value: {
            ...error.toSerialize(),
            debug: { message: { property: "show" } },
          },
        });
      });
    });

    test("if property show is set to false", async () => {
      const result = await sut({
        query: {
          show: false,
        },
      });

      const error = new UnprocessableEntityError()
        .setCode("VALIDATION")
        .setMessage("Você não quer exibir o 'Hello world' :(");

      expect(result.status).toEqual(error.statusCode);
      expect(result.error).toMatchObject({ value: error.toSerialize() });
    });
  });

  describe("should be able to get hello world", async () => {
    test("if property show is set to true", async () => {
      const result = await sut({
        query: {
          show: true,
        },
      });

      expect(result.status).toEqual(200);
      expect(result.data).toStrictEqual({ message: "Hello world!" });
    });
  });
});
