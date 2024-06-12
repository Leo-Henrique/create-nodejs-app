import { app } from "./app";
import { env } from "./env";

(async () => {
  await app.ready();
  await app.listen({ host: "0.0.0.0", port: env.API_PORT });

  console.log(`Application "${env.API_NAME}" is running!`);

  if (env.NODE_ENV === "development")
    console.log(`http://localhost:${env.API_PORT}/docs`);
})();
