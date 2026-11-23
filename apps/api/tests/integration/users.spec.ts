import type { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import type { User } from '../../src/users/users.schema.ts';
import { SYSTEM_CATEGORIES } from '../../src/categories/categories.constants.ts';
import { categoriesTable } from '../../src/categories/categories.schema.ts';
import { CategoriesService } from '../../src/categories/categories.service.ts';
import { UserNotFoundError } from '../../src/users/users.exceptions.ts';
import { usersTable } from '../../src/users/users.schema.ts';
import { UsersService } from '../../src/users/users.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import { createUser } from './helpers/factories.ts';

async function findUser(db: Database, id: number): Promise<User | undefined> {
    const [row] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, id));

    return row;
}

describe('UsersService', () => {
    let db: Database;
    let pool: Pool;
    let service: UsersService;
    let categoriesService: CategoriesService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));

        categoriesService = new CategoriesService(db);
        service = new UsersService(db, categoriesService);
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await resetDatabase(db);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('findById', () => {
        it('returns the requested user', async () => {
            const user = await createUser(db);

            await expect(service.findById(user.id)).resolves.toEqual(user);
        });

        it('throws UserNotFoundError when the user does not exist', async () => {
            await expect(service.findById(999)).rejects.toThrow(
                UserNotFoundError,
            );
        });
    });

    describe('findAll', () => {
        it('returns an empty list when there are no users', async () => {
            await expect(service.findAll()).resolves.toEqual([]);
        });

        it('returns all users ordered by id', async () => {
            const user = await createUser(db);
            const other = await createUser(db);

            await expect(service.findAll()).resolves.toEqual([user, other]);
        });
    });

    describe('create', () => {
        it('successfully creates a new user', async () => {
            const created = await service.create({ name: 'Jhon' });
            await expect(findUser(db, created.id)).resolves.toEqual(created);
        });

        it('creates the system categories for the new user', async () => {
            const user = await service.create({ name: 'Jhon' });

            const categories = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.userId, user.id));

            expect(categories).toHaveLength(2);
            expect(categories).toEqual(
                expect.arrayContaining(
                    SYSTEM_CATEGORIES.map((category) =>
                        expect.objectContaining({
                            userId: user.id,
                            ...category,
                            isSystem: true,
                            active: true,
                        }),
                    ),
                ),
            );
        });

        it('rolls back user creation when system categories creation fails', async () => {
            vi.spyOn(
                categoriesService,
                'createSystemCategories',
            ).mockRejectedValueOnce(new Error('Category creation failed'));

            await expect(service.create({ name: 'John' })).rejects.toThrow(
                'Category creation failed',
            );

            await expect(service.findAll()).resolves.toEqual([]);
        });
    });

    describe('update', () => {
        it('updates the name and returns the updated user', async () => {
            const user = await createUser(db);

            await expect(
                service.update(user.id, { name: 'Alice' }),
            ).resolves.toMatchObject({ name: 'Alice' });

            await expect(findUser(db, user.id)).resolves.toMatchObject({
                name: 'Alice',
            });
        });

        it('throws UserNotFoundError when the user does not exist', async () => {
            await expect(service.update(999, { name: 'Jhon' })).rejects.toThrow(
                UserNotFoundError,
            );
        });
    });
});
