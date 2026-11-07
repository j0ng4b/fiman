import { sql } from "drizzle-orm";
import {
    check,
    date,
    foreignKey,
    index,
    integer,
    snakeCase,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.schema.ts";
import { accountsTable } from "../accounts/accounts.schema.ts";

export const transfersTable = snakeCase.table(
    "transfers",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        amount: integer().notNull(),
        date: date({ mode: "string" }).notNull(),
        description: text(),
        fromAccountId: integer().notNull(),
        toAccountId: integer().notNull(),
        userId: integer()
            .references(() => usersTable.id, { onDelete: "restrict" })
            .notNull(),
        createdAt: timestamp({ withTimezone: true, mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        check("transfers_amount_positive_ck", sql`${table.amount} > 0`),
        check(
            "transfers_distinct_accounts_ck",
            sql`${table.fromAccountId} <> ${table.toAccountId}`,
        ),

        foreignKey({
            name: "transfers_from_account_user_fk",
            columns: [table.fromAccountId, table.userId],
            foreignColumns: [accountsTable.id, accountsTable.userId],
        }).onDelete("restrict"),

        foreignKey({
            name: "transfers_to_account_user_fk",
            columns: [table.toAccountId, table.userId],
            foreignColumns: [accountsTable.id, accountsTable.userId],
        }).onDelete("restrict"),

        index("transfers_from_account_date_idx").on(
            table.fromAccountId,
            table.date,
        ),

        index("transfers_to_account_date_idx").on(
            table.toAccountId,
            table.date,
        ),
    ],
);
