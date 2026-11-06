import {
    boolean,
    integer,
    pgEnum,
    snakeCase,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "../users/users.schema.ts";

export const categoryType = pgEnum("category_type", ["I", "E"]);

export const categoriesTable = snakeCase.table("categories", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
    type: categoryType().notNull(),
    isSystem: boolean().default(false).notNull(),
    active: boolean().default(true).notNull(),
    userId: integer()
        .references(() => usersTable.id, { onDelete: "restrict" })
        .notNull(),
    createdAt: timestamp({ withTimezone: true, mode: "string" })
        .defaultNow()
        .notNull(),
});
