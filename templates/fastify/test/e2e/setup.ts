import { app } from "@/app";
import { afterAll, beforeAll } from "vitest";

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});
