import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import { CategoriesService } from '../../src/categories/categories.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';

describe('CategoriesService', () => {
    let db: Database;
    let pool: Pool;
    let service: CategoriesService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));
        service = new CategoriesService(db);
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

    describe('setActive', () => {});

    describe('createSystemCategories', () => {});
});
