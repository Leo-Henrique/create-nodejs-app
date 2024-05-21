import { app } from "./app";
import { env } from "./env";

(async () => {
  await app.listen({ port: env.APP_PORT });

  console.log(`Application "${env.APP_NAME}" is running!`);

  if (env.NODE_ENV === "development") {
    console.log(`http://localhost:${env.APP_PORT}/docs`);
  }
})();
