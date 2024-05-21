import cors from "@fastify/cors";
import fastify from "fastify";
import { env } from "./env";

export const app = fastify();

app.register(cors, { origin: env.APP_ACCESS_CLIENT_SIDE_ALLOWED });
