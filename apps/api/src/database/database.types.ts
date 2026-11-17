import type { drizzle } from 'drizzle-orm/node-postgres';

export type Database = ReturnType<typeof drizzle>;
export type DbTransaction = Parameters<
    Parameters<Database['transaction']>[0]
>[0];
export type DbExecutor = Database | DbTransaction;
