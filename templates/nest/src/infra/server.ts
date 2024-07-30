import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import packageJson from "package.json";
import { AppModule } from "./app.module";
import { env } from "./env";

(async () => {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      cors: {
        origin: env.API_ACCESS_PERMISSION_CLIENT_SIDE,
      },
    },
  );

  const swaggerDocumentConfig = new DocumentBuilder()
    .setTitle(env.API_NAME)
    .setDescription("")
    .setVersion(packageJson.version)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(
    app,
    swaggerDocumentConfig,
  );
  const swaggerPath = "docs";

  SwaggerModule.setup(swaggerPath, app, swaggerDocument, {
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  });

  await app.listen(env.API_PORT, "0.0.0.0");

  console.log(`Application "${env.API_NAME}" is running!`);

  if (env.NODE_ENV === "development")
    console.log(`http://localhost:${env.API_PORT}/${swaggerPath}`);
})();
