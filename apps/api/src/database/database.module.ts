import { Module } from "@nestjs/common";
import { DatabaseProvider } from "./database.provider.ts";

@Module({
    providers: [DatabaseProvider],
    exports: [DatabaseProvider],
})
export class DatabaseModule {}
