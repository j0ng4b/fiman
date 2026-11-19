import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import { TransactionsService } from '../../src/transactions/transactions.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';

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

    describe('findById', () => {});

    describe('findAll', () => {});

    describe('create', () => {});

    describe('update', () => {});

    describe('realize', () => {});

    describe('cancel', () => {});

    describe('reverse', () => {});
});
