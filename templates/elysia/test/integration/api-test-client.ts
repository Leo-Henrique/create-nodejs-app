import { app } from "@/http/app";
import { treaty } from "@elysiajs/eden";

export const apiTestClient = treaty(app);
