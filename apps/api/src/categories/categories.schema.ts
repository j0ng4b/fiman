import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
    boolean,
    check,
    integer,
    pgEnum,
    snakeCase,
    text,
    timestamp,
    unique,
} from 'drizzle-orm/pg-core';

import { usersTable } from '../users/users.schema.ts';

export const entryType = pgEnum('entry_type', ['I', 'E']);

export const categoriesTable = snakeCase.table(
    'categories',
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        name: text().notNull(),
        type: entryType().notNull(),
        isSystem: boolean().default(false).notNull(),
        active: boolean().default(true).notNull(),
        userId: integer()
            .references(() => usersTable.id, { onDelete: 'restrict' })
            .notNull(),
        createdAt: timestamp({ withTimezone: true, mode: 'string' })
            .defaultNow()
            .notNull(),
    },

    (table) => [
        unique('categories_id_user_type_uq').on(
            table.id,
            table.userId,
            table.type,
        ),

        unique('categories_user_type_name_uq').on(
            table.userId,
            table.type,
            table.name,
        ),

        check(
            'categories_system_active_ck',
            sql`NOT ${table.isSystem} OR ${table.active}`,
        ),
    ],
);

export type Category = InferSelectModel<typeof categoriesTable>;
export type NewCategory = InferInsertModel<typeof categoriesTable>;
