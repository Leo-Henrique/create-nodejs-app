import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { HelloMultipartController } from "./controllers/hello/hello-multipart.controller";
import { HelloController } from "./controllers/hello/hello.controller";
import { DomainExceptionFilter } from "./filters/domain-exception.filter";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
  ],
  controllers: [HelloController, HelloMultipartController],
})
export class HttpModule {}
