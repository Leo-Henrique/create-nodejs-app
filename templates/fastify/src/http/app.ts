import packageJson from "@/../package.json";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "../env";
import { errorHandlerPlugin } from "./plugins/error-handler.plugin";
import { notFoundErrorHandlerPlugin } from "./plugins/not-found-error-handler.plugin";
import { swaggerUiPlugin } from "./plugins/swagger-ui.plugin";
import { routesPlugin } from "./plugins/routes.plugin";

export const app = fastify().withTypeProvider<ZodTypeProvider>();
export const appPrefix = "/v1";

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, { origin: env.API_ACCESS_PERMISSION_CLIENT_SIDE });
app.register(fastifyCookie);
app.register(fastifySwagger, {
  openapi: {
    openapi: "3.1.0",
    info: {
      title: env.API_NAME ?? "",
      version: packageJson.version,
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
});
app.register(swaggerUiPlugin);
app.register(routesPlugin, { prefix: appPrefix });
app.setErrorHandler(errorHandlerPlugin);
app.setNotFoundHandler(notFoundErrorHandlerPlugin);
