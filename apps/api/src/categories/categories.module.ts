import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.ts';
import { CategoriesService } from './categories.service.ts';

@Module({
    imports: [DatabaseModule],
    providers: [CategoriesService],
    exports: [CategoriesService],
})
export class CategoriesModule {}
