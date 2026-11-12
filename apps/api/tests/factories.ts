import type { Database } from '../src/database/database.types.ts';
import { usersTable } from '../src/users/users.schema.ts';

function first<T>(rows: T[]): T {
    const [row] = rows;
    if (!row) {
        throw new Error('Insert did not return a row');
    }

    return row;
}

export async function createUser(db: Database, name = 'Tester') {
    return first(await db.insert(usersTable).values({ name }).returning());
}
