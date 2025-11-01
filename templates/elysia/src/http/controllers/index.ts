import Elysia from "elysia";
import { helloController } from "./hello.controller";

export const controllers = new Elysia().use(helloController);
