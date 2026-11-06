import { sql } from "drizzle-orm";
import {
    check,
    date,
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
    },
    (table) => [
        check("transfers_amount_positive_ck", sql`${table.amount} > 0`),
        check(
            "transfers_distinct_accounts_ck",
            sql`${table.fromAccountId} <> ${table.toAccountId}`,
        ),

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
