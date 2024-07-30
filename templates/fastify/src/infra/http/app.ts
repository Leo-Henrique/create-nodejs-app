import packageJson from "@/../package.json";
import fastifyCookie from "@fastify/cookie";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastify from "fastify";
import multer from "fastify-multer";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { env } from "../env";
import { errorHandlerPlugin } from "./plugins/error-handler.plugin";
import { handleSwaggerMultipart } from "./plugins/handle-swagger-multipart.plugin";
import { routes } from "./routes";

export const app = fastify();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: env.API_NAME ?? "",
      version: packageJson.version,
    },
    servers: [],
  },
  transform: data => {
    const jsonSchema = jsonSchemaTransform(data);

    handleSwaggerMultipart(jsonSchema.schema);

    return jsonSchema;
  },
});
app.register(fastifySwaggerUi, { routePrefix: "/docs" });
app.register(fastifyCors, { origin: env.API_ACCESS_PERMISSION_CLIENT_SIDE });
app.register(fastifyCookie);
app.register(multer.contentParser);

app.setErrorHandler(errorHandlerPlugin);
app.register(routes);
