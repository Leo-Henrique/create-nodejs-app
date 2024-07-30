import { helloMultipartController } from "@/infra/http/controllers/hello/hello-multipart.controller";
import { helloController } from "@/infra/http/controllers/hello/hello.controller";
import { FastifyInstance } from "fastify";

export async function helloRoutes(app: FastifyInstance) {
  app.register(helloController);
  app.register(helloMultipartController);
}
