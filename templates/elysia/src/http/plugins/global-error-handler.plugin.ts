import type { ZodRestrictFieldsShape } from "@/@types/zod-utils";
import Elysia, {
	InternalServerError as ElysiaInternalServerError,
} from "elysia";
import {
	InternalServerError,
	ResourceNotFoundError,
	ValidationError,
} from "../errors";

type MetadataResponse = ReturnType<typeof plugin> extends Elysia<
	// biome-ignore-start lint/suspicious/noExplicitAny: unused generics
	any,
	any,
	any,
	// biome-ignore-end lint/suspicious/noExplicitAny: unused generics
	infer Metadata
>
	? Metadata["response"]
	: never;

function plugin() {
	return new Elysia({ name: "global-error-handler-plugin" }).onError(
		{ as: "global" },
		({ code, error }) => {
			switch (code) {
				case "NOT_FOUND": {
					return new ResourceNotFoundError().toController();
				}
				case "VALIDATION": {
					return new ValidationError()
						.setDebug({
							elysiaCode: code,
							name: error.name,
							statusCode: error.status,
							message: JSON.parse(error.message),
						})
						.toController();
				}
				case "PARSE":
				case "INVALID_COOKIE_SIGNATURE":
				case "INVALID_FILE_TYPE":
					return new ValidationError()
						.setStatusCode(400)
						.setDebug({
							elysiaCode: code,
							name: error.name,
							statusCode: error.status,
							message: error.message,
						})
						.toController();
				case "INTERNAL_SERVER_ERROR":
				case "UNKNOWN":
					console.error(error);

					return new InternalServerError()
						.setDebug({
							elysiaCode: code,
							name: error.name,
							...(error instanceof ElysiaInternalServerError && {
								statusCode: error.status,
							}),
							message: error.message,
						})
						.toController();
			}
		},
	);
}

function getErrorSchemas() {
	return {
		"422": new ValidationError().toZodSchema(),
		"400": new ValidationError().setStatusCode(400).toZodSchema(),
		"500": new InternalServerError().toZodSchema(),
	} satisfies Omit<ZodRestrictFieldsShape<MetadataResponse>, 404>;
}

export const globalErrorHandlerPlugin = Object.freeze({
	plugin,
	getErrorSchemas,
});
