import { accountsTable } from '../src/accounts/accounts.schema.ts';
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

export async function createAccount(
    db: Database,
    userId = -1,
    name = 'Test Account',
    initialBalance = 100,
    startDate = '2026-11-11',
) {
    if (userId < 1) {
        userId = (await createUser(db)).id;
    }

    return first(
        await db
            .insert(accountsTable)
            .values({ userId, name, initialBalance, startDate })
            .returning(),
    );
}
