import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AccountsModule } from './accounts/accounts.module.ts';
import { CategoriesModule } from './categories/categories.module.ts';
import { InstallmentsModule } from './installments/installments.module.ts';
import { TransactionsModule } from './transactions/transactions.module.ts';
import { TransfersModule } from './transfers/transfers.module.ts';
import { UsersModule } from './users/users.module.ts';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        AccountsModule,
        CategoriesModule,
        InstallmentsModule,
        TransactionsModule,
        TransfersModule,
        UsersModule,
    ],
})
export class AppModule {}
