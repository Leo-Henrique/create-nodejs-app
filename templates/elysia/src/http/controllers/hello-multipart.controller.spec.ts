import { faker } from "@faker-js/faker";
import { apiTestClient } from "test/integration/api-test-client";
import { beforeEach, describe, expect, test } from "vitest";
import { ValidationError } from "../errors";
import { helloController } from "./hello.controller";

const [route] = helloController.routes;
const sut = apiTestClient.hello.multipart.post;

describe(`[Controller] ${route.method} ${route.path}`, () => {
	let defaultInput: Parameters<typeof sut>[0];

	beforeEach(() => {
		const attachment = new File(
			[faker.lorem.sentences(5)],
			faker.system.commonFileName("txt"),
			{
				type: "text/plain",
				lastModified: Date.now(),
			},
		);

		defaultInput = {
			attachment,
		};
	});

	describe("should not be able to get hello world", () => {
		describe("if invalid input", () => {
			const error = new ValidationError();

			test("with invalid property show", async () => {
				const result = await sut(defaultInput, {
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
			const result = await sut(defaultInput, {
				query: {
					show: false,
				},
			});

			const error = new ValidationError().setMessage(
				"Você não quer exibir o 'Hello world' :(",
			);

			expect(result.status).toEqual(error.statusCode);
			expect(result.error).toMatchObject({ value: error.toSerialize() });
		});
	});

	describe("should be able to get hello world", async () => {
		test("if property show is set to true", async () => {
			const result = await sut(defaultInput, {
				query: {
					show: true,
				},
			});

			expect(result.status).toEqual(200);
			expect(result.data).toStrictEqual({
				message: "Hello world!",
				attachment: {
					name: defaultInput.attachment.name,
					mimetype: defaultInput.attachment.type,
					size: defaultInput.attachment.size,
				},
			});
		});
	});
});
