import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { HelloMultipartController } from "./controllers/hello/hello-multipart.controller";
import { HelloController } from "./controllers/hello/hello.controller";
import { AllExceptionFilter } from "./errors/filters/all-exception.filter";
import { DomainExceptionFilter } from "./errors/filters/domain-exception.filter";
import { FastifyMulterEventModule } from "./events/fastify-multer.event.module";

@Module({
  imports: [FastifyMulterEventModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
  controllers: [HelloController, HelloMultipartController],
})
export class HttpModule {}
