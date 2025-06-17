import { env } from "@/env";
import { faker } from "@faker-js/faker";
import {
  createSafeFormData,
  CreateSafeFormDataOutput,
} from "test/integration/create-safe-form-data";
import { createTestRequest } from "test/integration/create-test-request";
import { OverrideProperties } from "type-fest";
import { beforeEach, describe, expect, test } from "vitest";
import { appPrefix } from "../app";
import { ValidationError } from "../errors";
import {
  HelloMultipartControllerBodyInput,
  helloMultipartControllerMethod,
  helloMultipartControllerUrl,
} from "./hello-multipart.controller";

const sutMethod = helloMultipartControllerMethod;
const sutUrl = appPrefix + helloMultipartControllerUrl;

type FormDataInput = OverrideProperties<
  HelloMultipartControllerBodyInput,
  {
    attachment: Blob;
  }
>;

const createFormData = createSafeFormData<FormDataInput>;

const sut = createTestRequest<{
  body: FormData;
}>({
  method: sutMethod,
  url: sutUrl,
});

describe(`[Controller] ${sutMethod} ${sutUrl}`, () => {
  let defaultFormDataInput: CreateSafeFormDataOutput<FormDataInput>;

  beforeEach(() => {
    const randomText = faker.lorem.sentences(2);
    const randomTextBlob = new Blob([randomText], { type: "text/plain" });

    defaultFormDataInput = createFormData({
      show: "true",
      attachment: randomTextBlob,
    });
  });

  describe("should not be able to get hello world with multipart/form-data content-type", () => {
    describe("if invalid input", () => {
      const error = new ValidationError(null);

      test("with invalid property show", async () => {
        const formDataInput = createFormData({
          ...defaultFormDataInput.input,
          // @ts-expect-error the value must be a string
          show: 0,
        });

        const result = await sut({
          body: formDataInput.formData,
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
      const formDataInput = createFormData({
        ...defaultFormDataInput.input,
        show: "false",
      });

      const result = await sut({
        body: formDataInput.formData,
      });

      const error = new ValidationError(
        `Você não quer exibir o "Hello world" :(`,
      );

      expect(result.statusCode).toEqual(error.statusCode);
      expect(result.body).toStrictEqual(error.serialize());
    });
  });

  describe("should be able to get hello world with multipart/form-data content-type", async () => {
    test("if property show is set to true", async () => {
      const formDataInput = createFormData({
        ...defaultFormDataInput.input,
        show: "true",
      });

      const result = await sut({
        body: formDataInput.formData,
      });

      expect(result.statusCode).toEqual(200);
      expect(result.body).toStrictEqual({
        message: "Hello world!",
        attachment: {
          type: "file",
          encoding: "7bit",
          mimetype: "text/plain",
          fileStream: expect.any(Object),
          fileOriginalName: "blob",
          fileName: expect.any(String),
          filePath: expect.stringContaining(env.TMP_FILES_PATH),
        },
      });
    });
  });
});
