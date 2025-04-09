import { createTestRequest } from "test/integration/create-test-request";
import { describe, expect, test } from "vitest";
import { appPrefix } from "../app";
import { ValidationError } from "../errors";
import {
  helloControllerMethod,
  HelloControllerQueryParamsInput,
  helloControllerUrl,
} from "./hello.controller";

const sutMethod = helloControllerMethod;
const sutUrl = appPrefix + helloControllerUrl;

const sut = createTestRequest<{
  query: HelloControllerQueryParamsInput;
}>({
  method: sutMethod,
  url: sutUrl,
});

describe(`[Controller] ${sutMethod} ${sutUrl}`, () => {
  describe("should not be able to get hello world", () => {
    describe("if invalid input", () => {
      const error = new ValidationError(null);

      test("with invalid property show", async () => {
        const result = await sut({
          query: {
            // @ts-expect-error the value must be a string
            show: 0,
          },
        });

        expect(result.statusCode).toEqual(error.statusCode);
        expect(result.body).toMatchObject({
          ...error.serialize(),
          debug: [
            expect.objectContaining({
              instancePath: "/show",
            }),
          ],
        });
      });
    });

    test("if property show is set to false", async () => {
      const result = await sut({
        query: {
          show: "false",
        },
      });

      const error = new ValidationError(
        `Você não quer exibir o "Hello world" :(`,
      );

      expect(result.statusCode).toEqual(error.statusCode);
      expect(result.body).toStrictEqual(error.serialize());
    });
  });

  describe("should be able to get hello world", async () => {
    test("if property show is set to true", async () => {
      const result = await sut({
        query: {
          show: "true",
        },
      });

      expect(result.statusCode).toEqual(200);
      expect(result.body).toStrictEqual({ message: "Hello world!" });
    });
  });
});
