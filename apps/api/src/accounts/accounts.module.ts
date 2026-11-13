import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module.ts';
import { AccountsController } from './accounts.controller.ts';
import { AccountsService } from './accounts.service.ts';

@Module({
    imports: [DatabaseModule],
    providers: [AccountsService],
    controllers: [AccountsController],
})
export class AccountsModule {}
