import { Module, OnApplicationBootstrap } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import multer from "fastify-multer";

@Module({})
export class FastifyMulterEventModule implements OnApplicationBootstrap {
  constructor(private httpAdapterHost: HttpAdapterHost<FastifyAdapter>) {}

  onApplicationBootstrap() {
    const app = this.httpAdapterHost.httpAdapter.getInstance();

    app.register(multer.contentParser);
  }
}
