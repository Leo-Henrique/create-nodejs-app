import Elysia from "elysia";
import { helloMultipartController } from "./hello-multipart.controller";
import { helloController } from "./hello.controller";

export const controllers = new Elysia()
  .use(helloController)
  .use(helloMultipartController);
