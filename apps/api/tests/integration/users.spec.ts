import type { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { inject } from 'vitest';

import type { Database } from '../../src/database/database.types.ts';
import { SYSTEM_CATEGORIES } from '../../src/categories/categories.constants.ts';
import { categoriesTable } from '../../src/categories/categories.schema.ts';
import { CategoriesService } from '../../src/categories/categories.service.ts';
import { UserNotFoundError } from '../../src/users/users.exceptions.ts';
import { usersTable } from '../../src/users/users.schema.ts';
import { UsersService } from '../../src/users/users.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';

import { createUser } from '../../tests/factories.ts';

describe('UsersService', () => {
    let db: Database;
    let pool: Pool;
    let service: UsersService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));
        service = new UsersService(db, new CategoriesService(db));
    });

    afterAll(async () => {
        await pool.end();
    });

    beforeEach(async () => {
        await resetDatabase(db);
    });

    async function findRow(id: number) {
        const [row] = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id));
        return row;
    }

    describe('findById', () => {
        it('returns the requested user', async () => {
            const user = await createUser(db);

            await expect(service.findById(user.id)).resolves.toEqual(user);
        });

        it('throws UserNotFoundError when the user does not exist', async () => {
            await expect(service.findById(999)).rejects.toBeInstanceOf(
                UserNotFoundError,
            );
        });

        it('does not return a different user', async () => {
            const user = await createUser(db);
            const other = await createUser(db);

            await expect(service.findById(other.id)).resolves.not.toEqual(user);
        });
    });

    describe('findAll', () => {
        it('returns an empty list when there are no users', async () => {
            await expect(service.findAll()).resolves.toEqual([]);
        });

        it('return every user', async () => {
            const user = await createUser(db);
            const other = await createUser(db);

            const users = await service.findAll();

            expect(users).toHaveLength(2);
            expect(users).toEqual(expect.arrayContaining([user, other]));
        });
    });

    describe('create', () => {
        it('returns the created user with its gnerated fields', async () => {
            const user = await service.create({ name: 'Jhon' });

            expect(user).toEqual({
                id: 1,
                name: 'Jhon',
                createdAt: expect.any(String),
            });
        });

        it('persists the user', async () => {
            const user = await service.create({ name: 'Jhon' });

            await expect(findRow(user.id)).resolves.toEqual(user);
        });

        it('gives each user a distinct id', async () => {
            const first = await service.create({ name: 'first' });
            const second = await service.create({ name: 'second' });

            expect(first.id).not.toBe(second.id);
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
                            ...category,
                            isSystem: true,
                            active: true,
                        }),
                    ),
                ),
            );
        });
    });

    describe('update', () => {
        it('updates the name and returns the updated user', async () => {
            const user = await createUser(db);
            const updated = await service.update(user.id, { name: 'New Name' });

            expect(updated).toEqual({ ...user, name: 'New Name' });
        });

        it('persists the change', async () => {
            const user = await createUser(db);

            await service.update(user.id, { name: 'New Name' });

            expect((await findRow(user.id)).name).toBe('New Name');
        });

        it('does not touch other users', async () => {
            const user = await createUser(db);
            const other = await createUser(db);

            await service.update(user.id, { name: 'New Name' });

            await expect(findRow(other.id)).resolves.toEqual(other);
        });

        it('throws UserNotFoundError when the user does not exist', async () => {
            await expect(
                service.update(999, { name: 'Jhon' }),
            ).rejects.toBeInstanceOf(UserNotFoundError);
        });
    });
});
