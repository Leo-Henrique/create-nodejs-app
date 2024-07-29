import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { HelloMultipartController } from "./controllers/hello/hello-multipart.controller";
import { HelloController } from "./controllers/hello/hello.controller";
import { DomainExceptionFilter } from "./filters/domain-exception.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  controllers: [HelloController, HelloMultipartController],
})
export class HttpModule {}
