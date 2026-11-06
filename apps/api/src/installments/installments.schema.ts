import { sql } from "drizzle-orm";
import {
    check,
    date,
    foreignKey,
    integer,
    smallint,
    snakeCase,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.schema.ts";
import { accountsTable } from "../accounts/accounts.schema.ts";
import { categoriesTable, entryType } from "../categories/categories.schema.ts";

export const installmentsTable = snakeCase.table(
    "installments",
    {
        id: integer().generatedAlwaysAsIdentity().primaryKey(),
        type: entryType().notNull(),
        description: text().notNull(),
        totalAmount: integer().notNull(),
        installmentCount: smallint().notNull(),
        firstInstallmentDate: date({ mode: "string" }).notNull(),
        userId: integer()
            .references(() => usersTable.id, { onDelete: "restrict" })
            .notNull(),
        accountId: integer()
            .references(() => accountsTable.id, { onDelete: "restrict" })
            .notNull(),
        categoryId: integer().notNull(),
        createdAt: timestamp({ withTimezone: true, mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        check("installments_count_min_ck", sql`${table.installmentCount} >= 1`),
        check(
            "installments_total_amount_positive_ck",
            sql`${table.totalAmount} > 0`,
        ),

        foreignKey({
            name: "installments_category_type_fk",
            columns: [table.categoryId, table.type],
            foreignColumns: [categoriesTable.id, categoriesTable.type],
        }).onDelete("restrict"),
    ],
);
