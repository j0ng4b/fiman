import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module.ts';
import { DatabaseModule } from '../database/database.module.ts';

import { UsersController } from './users.controller.ts';
import { UsersService } from './users.service.ts';

@Module({
    imports: [DatabaseModule, CategoriesModule],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
