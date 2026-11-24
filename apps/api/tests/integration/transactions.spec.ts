import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import { TransactionNotFoundError } from '../../src/transactions/transactions.exceptions.ts';
import { TransactionsService } from '../../src/transactions/transactions.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import {
    createAccount,
    createCategory,
    createPlannedTransaction,
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

    describe('findAll', () => {});

    describe('create', () => {});

    describe('update', () => {});

    describe('realize', () => {});

    describe('cancel', () => {});

    describe('reverse', () => {});
});
