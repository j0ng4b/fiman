import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.ts';

import { TransactionsController } from './transactions.controller.ts';
import { TransactionsService } from './transactions.service.ts';

@Module({
    imports: [DatabaseModule],
    providers: [TransactionsService],
    controllers: [TransactionsController],
    exports: [TransactionsService],
})
export class TransactionsModule {}
