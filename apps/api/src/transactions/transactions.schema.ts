import { sql } from 'drizzle-orm';
import {
    check,
    date,
    foreignKey,
    index,
    integer,
    pgEnum,
    snakeCase,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';

import { accountsTable } from '../accounts/accounts.schema.ts';
import { categoriesTable, entryType } from '../categories/categories.schema.ts';
import { installmentsTable } from '../installments/installments.schema.ts';
import { usersTable } from '../users/users.schema.ts';

export const transactionStatus = pgEnum('transaction_status', ['P', 'C', 'X']);

export const transactionsTable = snakeCase.table(
    'transactions',
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        type: entryType().notNull(),
        status: transactionStatus().notNull(),
        description: text().notNull(),
        amount: integer().notNull(),
        dueDate: date({ mode: 'string' }).notNull(),
        paidAmount: integer(),
        transactionDate: date({ mode: 'string' }),
        accountingMonth: date({ mode: 'string' }).notNull(),
        reversalDate: date({ mode: 'string' }),
        userId: integer()
            .references(() => usersTable.id, { onDelete: 'restrict' })
            .notNull(),
        accountId: integer().notNull(),
        categoryId: integer().notNull(),
        installmentId: integer(),
        installmentNumber: integer(),
        createdAt: timestamp({ withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp({ withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        check('transactions_amount_positive_ck', sql`${table.amount} > 0`),

        check(
            'transactions_paid_amount_positive_ck',
            sql`${table.paidAmount} IS NULL OR ${table.paidAmount} > 0`,
        ),

        check(
            'transactions_status_fields_ck',
            sql`(${table.status} = 'C'
                    AND ${table.transactionDate} IS NOT NULL
                    AND ${table.paidAmount} IS NOT NULL)
                OR (${table.status} <> 'C'
                    AND ${table.transactionDate} IS NULL
                    AND ${table.paidAmount} IS NULL)
            `,
        ),

        check(
            'transactions_reversal_ck',
            sql`${table.reversalDate} IS NULL
                OR (${table.status} = 'C'
                AND ${table.reversalDate} >= ${table.transactionDate})`,
        ),

        check(
            'transactions_accounting_month_ck',
            sql`EXTRACT(day from ${table.accountingMonth}) = 1
                AND ${table.accountingMonth} <= ${table.dueDate}`,
        ),

        check(
            'transactions_installments_pair_ck',
            sql`(${table.installmentId} IS NULL) = (${table.installmentNumber} IS NULL)`,
        ),

        foreignKey({
            name: 'transactions_account_user_fk',
            columns: [table.accountId, table.userId],
            foreignColumns: [accountsTable.id, accountsTable.userId],
        }).onDelete('restrict'),

        foreignKey({
            name: 'transactions_category_user_type_fk',
            columns: [table.categoryId, table.userId, table.type],
            foreignColumns: [
                categoriesTable.id,
                categoriesTable.userId,
                categoriesTable.type,
            ],
        }).onDelete('restrict'),

        foreignKey({
            name: 'transactions_installment_user_fk',
            columns: [table.installmentId, table.userId],
            foreignColumns: [installmentsTable.id, installmentsTable.userId],
        }).onDelete('restrict'),

        unique('transactions_installments_uq').on(
            table.installmentId,
            table.installmentNumber,
        ),

        index('transactions_account_due_date_idx').on(
            table.accountId,
            table.dueDate,
        ),

        index('transactions_account_transaction_date_idx').on(
            table.accountId,
            table.transactionDate,
        ),

        index('transactions_account_accounting_month_idx').on(
            table.accountId,
            table.accountingMonth,
        ),
    ],
);
