import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import { AccountNotFoundError } from '../../src/accounts/accounts.exceptions.ts';
import { AccountsService } from '../../src/accounts/accounts.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import { createAccount, createUser } from './helpers/factories.ts';

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

    describe('findAll', () => {});

    describe('create', () => {});

    describe('update', () => {});

    describe('delete', () => {});

    describe('disable', () => {});
});
