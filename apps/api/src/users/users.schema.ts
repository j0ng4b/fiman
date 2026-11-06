import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: integer().generatedAlwaysAsIdentity().primaryKey(),
    name: text().notNull(),
});
