import { date, integer, snakeCase, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.schema.ts";
import { accountsTable } from "../accounts/accounts.schema.ts";

export const transfersTable = snakeCase.table("transfers", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    amount: integer().notNull(),
    date: date({ mode: "string" }).notNull(),
    description: text(),
    fromAccountId: integer()
        .references(() => accountsTable.id, { onDelete: "restrict" })
        .notNull(),
    toAccountId: integer()
        .references(() => accountsTable.id, { onDelete: "restrict" })
        .notNull(),
    userId: integer()
        .references(() => usersTable.id, { onDelete: "restrict" })
        .notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});
