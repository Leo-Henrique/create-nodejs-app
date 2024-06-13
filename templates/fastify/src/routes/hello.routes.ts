import { helloMultipartController } from "@/controllers/hello/hello-multipart.controller";
import { helloController } from "@/controllers/hello/hello.controller";
import { FastifyInstance } from "fastify";

export async function helloRoutes(app: FastifyInstance) {
  app.register(helloController);
  app.register(helloMultipartController);
}
