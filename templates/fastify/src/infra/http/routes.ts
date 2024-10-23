import { FastifyInstance } from "fastify";
import { helloController } from "./controllers/hello/hello.controller";
import { helloMultipartController } from "./controllers/hello/hello-multipart.controller";

export async function routes(app: FastifyInstance) {
  app.register(helloController);
  app.register(helloMultipartController);
}
