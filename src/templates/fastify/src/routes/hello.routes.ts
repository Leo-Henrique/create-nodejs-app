import { helloMultipartController } from "@/controllers/hello-multipart.controller";
import { FastifyInstance } from "fastify";
import { helloController } from "../controllers/hello.controller";

export async function helloRoutes(app: FastifyInstance) {
  app.register(helloController);
  app.register(helloMultipartController);
}
