import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.ts';

import { TransactionsService } from './transactions.service.ts';

@Module({
    imports: [DatabaseModule],
    providers: [TransactionsService],
    exports: [TransactionsService],
})
export class TransactionsModule {}
