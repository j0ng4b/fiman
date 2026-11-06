import { integer, snakeCase, text } from "drizzle-orm/pg-core";

export const usersTable = snakeCase.table("users", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
});
