import {
    date,
    integer,
    pgEnum,
    snakeCase,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.schema.ts";
import { accountsTable } from "../accounts/accounts.schema.ts";
import { categoriesTable } from "../categories/categories.schema.ts";
import { installmentsTable } from "../installments/installments.schema.ts";

export const transactionType = pgEnum("transaction_type", ["I", "E"]);

export const transactionStatus = pgEnum("transaction_status", ["P", "C", "X"]);

export const transactionsTable = snakeCase.table("transactions", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    type: transactionType().notNull(),
    status: transactionStatus().notNull(),
    description: text().notNull(),
    amount: integer().notNull(),
    dueDate: date({ mode: "string" }).notNull(),
    paidAmount: integer(),
    transactionDate: date({ mode: "string" }),
    accountingMonth: date({ mode: "string" }).notNull(),
    reversalDate: date({ mode: "string" }),
    userId: integer()
        .references(() => usersTable.id, { onDelete: "restrict" })
        .notNull(),
    accountId: integer()
        .references(() => accountsTable.id, { onDelete: "restrict" })
        .notNull(),
    categoryId: integer()
        .references(() => categoriesTable.id, { onDelete: "restrict" })
        .notNull(),
    installmentId: integer().references(() => installmentsTable.id, {
        onDelete: "restrict",
    }),
    installmentNumber: integer(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp({ withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});
