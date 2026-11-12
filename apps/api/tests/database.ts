import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { Database } from '../src/database/database.types.ts';

export function createTestDatabase(url: string): {
    db: Database;
    pool: Pool;
} {
    const pool = new Pool({ connectionString: url });
    const db = drizzle({ client: pool });
    return { db, pool };
}

export async function resetDatabase(db: Database): Promise<void> {
    await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
}
