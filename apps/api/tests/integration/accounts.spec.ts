import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import { AccountsService } from '../../src/accounts/accounts.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';

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

    describe('findById', () => {});

    describe('findAll', () => {});

    describe('create', () => {});

    describe('update', () => {});

    describe('delete', () => {});

    describe('disable', () => {});
});
