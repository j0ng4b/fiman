import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Account } from '../../src/accounts/accounts.schema.ts';
import type { Category } from '../../src/categories/categories.schema.ts';
import type { Database } from '../../src/database/database.types.ts';
import type { Transaction } from '../../src/transactions/transactions.schema.ts';
import type { User } from '../../src/users/users.schema.ts';
import { TransactionNotFoundError } from '../../src/transactions/transactions.exceptions.ts';
import { TransactionsService } from '../../src/transactions/transactions.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import {
    createAccount,
    createCategory,
    createPlannedTransaction,
    createRealizedTransaction,
    createUser,
} from './helpers/factories.ts';

describe('TransactionService', () => {
    let db: Database;
    let pool: Pool;
    let service: TransactionsService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));
        service = new TransactionsService(db);
    });

    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await resetDatabase(db);
    });

    describe('findById', () => {
        it('returns the requested transaction', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I');
            const account = await createAccount(db, user.id);

            const transaction = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'I',
            );

            await expect(
                service.findById(user.id, transaction.id),
            ).resolves.toEqual(transaction);
        });

        it('throws TransactionNotFoundError when the transaction does not exist', async () => {
            const user = await createUser(db);

            await expect(service.findById(user.id, 99)).rejects.toThrow(
                TransactionNotFoundError,
            );
        });

        it('throws TransactionNotFoundError when the user does not own the transaction', async () => {
            const user = await createUser(db);
            const other = await createUser(db);
            const category = await createCategory(db, user.id, 'I');
            const account = await createAccount(db, user.id);

            const transaction = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'I',
            );

            await expect(
                service.findById(other.id, transaction.id),
            ).rejects.toThrow(TransactionNotFoundError);
        });
    });

    describe('findAll', () => {
        let user: User;
        let category: Category;
        let account: Account;

        beforeEach(async () => {
            user = await createUser(db);
            category = await createCategory(db, user.id, 'E');
            account = await createAccount(db, user.id);
        });

        it('returns all transactions of the user', async () => {
            let transactions: Transaction[] = [];
            for (let i = 0; i < 2; i++) {
                transactions.push(
                    await createPlannedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    ),
                );

                transactions.push(
                    await createRealizedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    ),
                );
            }

            const result = await service.findAll(user.id, {
                dateField: 'dueDate',
                limit: 10,
                offset: 0,
            });

            expect(result).toEqual({
                total: 4,
                limit: 10,
                offset: 0,
                items: expect.arrayContaining(transactions),
            });
            expect(result.items).toHaveLength(4);
        });

        it('returns an empty list when the user has no transactions', async () => {
            await expect(
                service.findAll(user.id, {
                    dateField: 'dueDate',
                    limit: 10,
                    offset: 0,
                }),
            ).resolves.toEqual({ total: 0, items: [], limit: 10, offset: 0 });
        });

        it('returns only the transactions belonging to the user', async () => {
            const userTransaction = await createRealizedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
            );

            const other = await createUser(db);
            const otherCategory = await createCategory(db, other.id, 'I');
            const otherAccount = await createAccount(db, other.id);
            await createPlannedTransaction(
                db,
                other.id,
                otherAccount.id,
                otherCategory.id,
                'I',
            );

            await expect(
                service.findAll(user.id, {
                    dateField: 'dueDate',
                    limit: 10,
                    offset: 0,
                }),
            ).resolves.toEqual({
                total: 1,
                items: [userTransaction],
                limit: 10,
                offset: 0,
            });
        });
    });

    describe('create', () => {});

    describe('update', () => {});

    describe('realize', () => {});

    describe('cancel', () => {});

    describe('reverse', () => {});
});
