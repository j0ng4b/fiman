import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import {
    snakeCase,
    integer,
    text,
    date,
    boolean,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';

import { usersTable } from '../users/users.schema.ts';

export const accountsTable = snakeCase.table(
    'accounts',
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        name: text().notNull(),
        initialBalance: integer().notNull(),
        startDate: date({ mode: 'string' }).notNull(),
        active: boolean().default(true).notNull(),
        userId: integer()
            .references(() => usersTable.id, { onDelete: 'restrict' })
            .notNull(),
        createdAt: timestamp({ withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },
    (table) => [unique('accounts_id_user_uq').on(table.id, table.userId)],
);

export type Account = InferSelectModel<typeof accountsTable>;
export type NewAccount = InferInsertModel<typeof accountsTable>;
