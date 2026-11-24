import type { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { inject } from 'vitest';

import type { Account } from '../../src/accounts/accounts.schema.ts';
import type { Database } from '../../src/database/database.types.ts';
import {
    AccountHasMovementsError,
    AccountInUseError,
    AccountNotFoundError,
    InvalidAccountStartDateError,
} from '../../src/accounts/accounts.exceptions.ts';
import { accountsTable } from '../../src/accounts/accounts.schema.ts';
import { AccountsService } from '../../src/accounts/accounts.service.ts';
import { today, tomorrow } from '../../src/common/dates.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import {
    createAccount,
    createCategory,
    createPlannedTransaction,
    createTransfer,
    createUser,
} from './helpers/factories.ts';

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
                    startDate: tomorrow(),
                    initialBalance: 0,
                }),
            ).rejects.toThrow(InvalidAccountStartDateError);
        });
    });

    describe('update', () => {
        it('successfully updates account data', async () => {
            const user = await createUser(db);
            const account = await createAccount(db, user.id);

            const updated = await service.update(user.id, account.id, {
                name: 'Investments',
                startDate: '2025-08-11',
                initialBalance: 10_000_00,
            });

            expect(updated).toMatchObject({
                name: 'Investments',
                startDate: '2025-08-11',
                initialBalance: 10_000_00,
            });

            await expect(findAccount(db, account.id)).resolves.toEqual(updated);
        });

        it('throws AccountNotFoundError when the account does not exist', async () => {
            const user = await createUser(db);

            await expect(
                service.update(user.id, 99, { name: 'NoExists' }),
            ).rejects.toThrow(AccountNotFoundError);
        });

        it('throws AccountNotFoundError when the user does not own account', async () => {
            const user = await createUser(db);
            const userAccount = await createAccount(db, user.id);

            const other = await createUser(db);

            await expect(
                service.update(other.id, userAccount.id, {
                    name: 'NotTheAccountOwner',
                }),
            ).rejects.toThrow(AccountNotFoundError);
        });

        it('throws InvalidAccountStartDateError when the start date is in the future', async () => {
            const user = await createUser(db);
            const account = await createAccount(db, user.id);

            await expect(
                service.update(user.id, account.id, {
                    startDate: tomorrow(),
                }),
            ).rejects.toThrow(InvalidAccountStartDateError);
        });

        it.for([
            ['startDate', '2024-11-26'],
            ['initialBalance', 200_00],
        ])(
            'rejects %s changes when the account has transactions',
            async (data) => {
                const user = await createUser(db);
                const category = await createCategory(db, user.id, 'I');
                const account = await createAccount(db, user.id);

                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'I',
                );

                await expect(
                    service.update(
                        user.id,
                        account.id,
                        Object.fromEntries([data]),
                    ),
                ).rejects.toThrow(AccountHasMovementsError);
            },
        );

        it.for([
            ['startDate', '2024-11-26'],
            ['initialBalance', 200_00],
        ])(
            'rejects %s changes when the account has transfers',
            async (data) => {
                const user = await createUser(db);
                const fromAccount = await createAccount(db, user.id);
                const toAccount = await createAccount(db, user.id);

                await createTransfer(db, user.id, fromAccount.id, toAccount.id);

                await expect(
                    service.update(
                        user.id,
                        fromAccount.id,
                        Object.fromEntries([data]),
                    ),
                ).rejects.toThrow(AccountHasMovementsError);

                await expect(
                    service.update(
                        user.id,
                        toAccount.id,
                        Object.fromEntries([data]),
                    ),
                ).rejects.toThrow(AccountHasMovementsError);
            },
        );
    });

    describe('delete', () => {
        it('successfully deletes an account', async () => {
            const user = await createUser(db);
            const account = await createAccount(db, user.id);

            await expect(
                service.delete(user.id, account.id),
            ).resolves.toBeUndefined();

            await expect(findAccount(db, account.id)).resolves.toBeUndefined();
        });

        it('throws AccountNotFoundError when the account does not exist', async () => {
            const user = await createUser(db);

            await expect(service.delete(user.id, 99)).rejects.toThrow(
                AccountNotFoundError,
            );
        });

        it('throws AccountNotFoundError when the user does not own the account', async () => {
            const user = await createUser(db);
            const other = await createUser(db);
            const account = await createAccount(db, user.id);

            await expect(service.delete(other.id, account.id)).rejects.toThrow(
                AccountNotFoundError,
            );

            await expect(
                findAccount(db, account.id),
            ).resolves.not.toBeUndefined();
        });

        it('throws AccountInUseError when the account has associated transactions', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'E');
            const account = await createAccount(db, user.id);

            await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
            );

            await expect(service.delete(user.id, account.id)).rejects.toThrow(
                AccountInUseError,
            );

            await expect(
                findAccount(db, account.id),
            ).resolves.not.toBeUndefined();
        });

        it('throws AccountInUseError when the account has associated transfers', async () => {
            const user = await createUser(db);
            const fromAccount = await createAccount(db, user.id);
            const toAccount = await createAccount(db, user.id);

            await createTransfer(db, user.id, fromAccount.id, toAccount.id);

            await expect(
                service.delete(user.id, fromAccount.id),
            ).rejects.toThrow(AccountInUseError);

            await expect(
                findAccount(db, fromAccount.id),
            ).resolves.not.toBeUndefined();

            // Also check when the account is the destination.
            await expect(service.delete(user.id, toAccount.id)).rejects.toThrow(
                AccountInUseError,
            );

            await expect(
                findAccount(db, toAccount.id),
            ).resolves.not.toBeUndefined();
        });
    });

    describe('disable', () => {});
});
