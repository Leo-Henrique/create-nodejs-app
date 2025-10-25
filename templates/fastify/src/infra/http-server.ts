import { env } from "@/env";
import { app } from "@/http/app";
import { swaggerUiPrefix } from "@/http/plugins/swagger-ui.plugin";

(async () => {
  await app.ready();
  await app.listen({ port: env.API_PORT });

  if (env.API_NAME) {
    console.log(`Application "${env.API_NAME}" is running!`);
  } else {
    console.log(`Application is running!`);
  }

  if (env.NODE_ENV === "development")
    console.log(`http://localhost:${env.API_PORT}${swaggerUiPrefix}`);
})();
