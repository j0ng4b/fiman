import type { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { inject } from 'vitest';

import type { Account } from '../../src/accounts/accounts.schema.ts';
import type { Database } from '../../src/database/database.types.ts';
import {
    AccountNotFoundError,
    InvalidAccountStartDateError,
} from '../../src/accounts/accounts.exceptions.ts';
import { accountsTable } from '../../src/accounts/accounts.schema.ts';
import { AccountsService } from '../../src/accounts/accounts.service.ts';
import { today, tomorrow } from '../../src/common/dates.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import { createAccount, createUser } from './helpers/factories.ts';

async function findAccount(
    db: Database,
    id: number,
): Promise<Account | undefined> {
    const [account] = await db
        .select()
        .from(accountsTable)
        .where(eq(accountsTable.id, id));

    return account;
}

describe('AccountsService', () => {
    let db: Database;
    let pool: Pool;
    let service: AccountsService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));
        service = new AccountsService(db);
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await resetDatabase(db);
    });

    describe('findById', () => {
        it('returns the requested account', async () => {
            const user = await createUser(db);
            const account = await createAccount(db, user.id);

            await expect(
                service.findById(user.id, account.id),
            ).resolves.toEqual(account);
        });

        it('throws AccountNotFoundError when the account does not exist', async () => {
            const user = await createUser(db);

            await expect(service.findById(user.id, 99)).rejects.toThrow(
                AccountNotFoundError,
            );
        });

        it('throws AccountNotFoundError when the user does not own the account', async () => {
            const user = await createUser(db);
            const other = await createUser(db);
            const account = await createAccount(db, user.id);

            await expect(
                service.findById(other.id, account.id),
            ).rejects.toThrow(AccountNotFoundError);
        });
    });

    describe('findAll', () => {
        it('returns all accounts of the user ordered by id', async () => {
            const user = await createUser(db);

            const checking = await createAccount(db, user.id);
            const investments = await createAccount(db, user.id);

            await expect(service.findAll(user.id)).resolves.toEqual([
                checking,
                investments,
            ]);
        });

        it('returns an empty list when the user has no accounts', async () => {
            const user = await createUser(db);

            await expect(service.findAll(user.id)).resolves.toEqual([]);
        });

        it('returns only the accounts belonging to the user', async () => {
            const user = await createUser(db);
            const other = await createUser(db);

            const account = await createAccount(db, user.id);
            await createAccount(db, other.id);

            await expect(service.findAll(user.id)).resolves.toEqual([account]);
        });
    });

    describe('create', () => {
        it('successfully creates a new account', async () => {
            const user = await createUser(db);

            const created = await service.create(user.id, {
                name: 'Checking',
                initialBalance: 10000,
                startDate: '2020-01-01',
            });

            expect(created).toMatchObject({
                userId: user.id,
                name: 'Checking',
                initialBalance: 10000,
                startDate: '2020-01-01',
            });

            await expect(findAccount(db, created.id)).resolves.toEqual(created);
        });

        it('defaults the start date to today when omitted', async () => {
            const user = await createUser(db);

            await expect(
                service.create(user.id, {
                    name: 'Investments',
                    initialBalance: 0,
                }),
            ).resolves.toMatchObject({ startDate: today() });
        });

        it('throws InvalidAccountStartDateError when the start date is in the future', async () => {
            const user = await createUser(db);

            await expect(
                service.create(user.id, {
                    name: 'Investments',
                    initialBalance: 0,
                    startDate: tomorrow(),
                }),
            ).rejects.toThrow(InvalidAccountStartDateError);
        });
    });

    describe('update', () => {});

    describe('delete', () => {});

    describe('disable', () => {});
});
