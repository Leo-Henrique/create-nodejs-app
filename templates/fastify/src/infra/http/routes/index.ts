import { FastifyInstance } from "fastify";
import { helloRoutes } from "./hello.routes";

export async function routes(app: FastifyInstance) {
  app.register(helloRoutes);
}
