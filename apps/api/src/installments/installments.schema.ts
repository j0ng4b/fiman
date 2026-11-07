import { sql } from 'drizzle-orm';
import {
    check,
    date,
    foreignKey,
    integer,
    smallint,
    snakeCase,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';

import { accountsTable } from '../accounts/accounts.schema.ts';
import { categoriesTable, entryType } from '../categories/categories.schema.ts';
import { usersTable } from '../users/users.schema.ts';

export const installmentsTable = snakeCase.table(
    'installments',
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        type: entryType().notNull(),
        description: text().notNull(),
        totalAmount: integer().notNull(),
        installmentCount: smallint().notNull(),
        firstInstallmentDate: date({ mode: 'string' }).notNull(),
        userId: integer()
            .references(() => usersTable.id, { onDelete: 'restrict' })
            .notNull(),
        accountId: integer().notNull(),
        categoryId: integer().notNull(),
        createdAt: timestamp({ withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        check('installments_count_min_ck', sql`${table.installmentCount} >= 1`),
        check(
            'installments_total_amount_positive_ck',
            sql`${table.totalAmount} > 0`,
        ),

        unique('installments_id_user_uq').on(table.id, table.userId),

        foreignKey({
            name: 'installments_account_user_fk',
            columns: [table.accountId, table.userId],
            foreignColumns: [accountsTable.id, accountsTable.userId],
        }).onDelete('restrict'),

        foreignKey({
            name: 'installments_category_user_type_fk',
            columns: [table.categoryId, table.userId, table.type],
            foreignColumns: [
                categoriesTable.id,
                categoriesTable.userId,
                categoriesTable.type,
            ],
        }).onDelete('restrict'),
    ],
);
