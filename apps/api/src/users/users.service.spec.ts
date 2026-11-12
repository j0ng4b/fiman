import { eq } from 'drizzle-orm';
import type { Pool } from 'pg';
import { inject } from 'vitest';

import { createTestDatabase, resetDatabase } from '../../tests/database.ts';
import { createUser } from '../../tests/factories.ts';
import { categoriesTable } from '../categories/categories.schema.ts';
import type { Database } from '../database/database.types.ts';
import { UserNotFoundError } from './users.exceptions.ts';
import { usersTable } from './users.schema.ts';
import { UsersService } from './users.service.ts';

const SYSTEM_CATEGORIES = [
    { name: 'Outros', type: 'I' },
    { name: 'Outros', type: 'E' },
] as const;

describe('UsersService', () => {
    let db: Database;
    let pool: Pool;
    let service: UsersService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));
        service = new UsersService(db);
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

        it.fails('creates the system categories for the new user', async () => {
            const user = await service.create({ name: 'Jhon' });

            const categories = await db
                .select()
                .from(categoriesTable)
                .where(eq(categoriesTable.userId, user.id));

            expect(categories).toHaveLength(2);
            expect(categories).toEqual(
                expect.arrayContaining(
                    SYSTEM_CATEGORIES.map((category) => ({
                        ...category,
                        isSystem: true,
                        active: true,
                        createdAt: expect.any(String),
                    })),
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
