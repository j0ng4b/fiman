import { NestFactory } from "@nestjs/core";
import { StandardSchemaValidationPipe } from "@nestjs/common";
import { type NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.ts";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(new StandardSchemaValidationPipe());

    await app.listen(process.env.PORT || 3000);
}

bootstrap();
