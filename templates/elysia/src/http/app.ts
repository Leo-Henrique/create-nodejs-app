import packageJson from "@/../package.json";
import { env } from "@/env";
import cors from "@elysiajs/cors";
import node from "@elysiajs/node";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { Elysia } from "elysia";
import z from "zod";
import { controllers } from "./controllers";
import "./controllers/hello.controller";
import { globalErrorHandlerPlugin } from "./plugins/global-error-handler.plugin";

export const openApiUrlPathname = "/openapi";

export const app = new Elysia({
	adapter: node(),
	// BUG(elysia 1.4.13): numbers in route paths prevents generate OpenAPI schema with 'fromTypes' function.
	// prefix: "/v1",
})
	.use(
		cors({
			origin: env.API_CORS_ALLOW_ORIGIN,
			methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		}),
	)
	.use(
		openapi({
			path: openApiUrlPathname,
			documentation: {
				info: {
					title: env.API_NAME,
					version: packageJson.version,
				},
			},
			mapJsonSchema: {
				zod: (schema: z.ZodType) => z.toJSONSchema(schema, { io: "input" }),
			},
			references: fromTypes(`.${__filename.replace(process.cwd(), "")}`),
		}),
	)
	.use(globalErrorHandlerPlugin.plugin())
	.use(controllers);
