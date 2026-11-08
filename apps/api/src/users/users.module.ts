import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.ts';
import { UsersController } from './users.controller.ts';
import { UsersService } from './users.service.ts';

@Module({
    imports: [DatabaseModule],
    providers: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
