import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, snakeCase, text, timestamp } from 'drizzle-orm/pg-core';

export const usersTable = snakeCase.table('users', {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true, mode: 'string' })
        .defaultNow()
        .notNull(),
});

export type User = InferSelectModel<typeof usersTable>;
export type NewUser = InferInsertModel<typeof usersTable>;
