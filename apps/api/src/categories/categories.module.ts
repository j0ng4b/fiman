import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.ts';

import { CategoriesController } from './categories.controller.ts';
import { CategoriesService } from './categories.service.ts';

@Module({
    imports: [DatabaseModule],
    providers: [CategoriesService],
    controllers: [CategoriesController],
    exports: [CategoriesService],
})
export class CategoriesModule {}
