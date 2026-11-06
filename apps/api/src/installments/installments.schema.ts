import {
    date,
    integer,
    pgEnum,
    smallint,
    snakeCase,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.schema.ts";
import { accountsTable } from "../accounts/accounts.schema.ts";
import { categoriesTable } from "../categories/categories.schema.ts";

export const installmentType = pgEnum("installment_type", ["I", "E"]);

export const installmentsTable = snakeCase.table("installments", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    type: installmentType().notNull(),
    description: text().notNull(),
    totalAmout: integer().notNull(),
    installmentCount: smallint().notNull(),
    firstInstallmentDate: date({ mode: "string" }).notNull(),
    userId: integer()
        .references(() => usersTable.id, { onDelete: "restrict" })
        .notNull(),
    accountId: integer()
        .references(() => accountsTable.id, { onDelete: "restrict" })
        .notNull(),
    categoryId: integer()
        .references(() => categoriesTable.id, { onDelete: "restrict" })
        .notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});
