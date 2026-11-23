import type { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { inject } from 'vitest';

import type { Category } from '../../src/categories/categories.schema.ts';
import type { EntryType } from '../../src/common/dto.ts';
import type { Database } from '../../src/database/database.types.ts';
import {
    CategoryAlreadyExistsError,
    CategoryInUseError,
    CategoryIsSystemError,
    CategoryNotFoundError,
} from '../../src/categories/categories.exceptions.ts';
import { categoriesTable } from '../../src/categories/categories.schema.ts';
import { CategoriesService } from '../../src/categories/categories.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import {
    createAccount,
    createCategory,
    createPlannedTransaction,
    createUser,
} from './helpers/factories.ts';

async function findCategory(
    db: Database,
    id: number,
): Promise<Category | undefined> {
    const [category] = await db
        .select()
        .from(categoriesTable)
        .where(eq(categoriesTable.id, id));

    return category;
}

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

    describe('findById', () => {
        it('returns the requested category', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I');

            await expect(
                service.findById(user.id, category.id),
            ).resolves.toEqual(category);
        });

        it('throws CategoryNotFoundError when the category does not exist', async () => {
            const user = await createUser(db);

            await expect(service.findById(user.id, 99)).rejects.toThrow(
                CategoryNotFoundError,
            );
        });

        it('throws CategoryNotFoundError when the user does not own the category', async () => {
            const owner = await createUser(db);
            const otherUser = await createUser(db);
            const category = await createCategory(db, owner.id, 'E');

            await expect(
                service.findById(otherUser.id, category.id),
            ).rejects.toThrow(CategoryNotFoundError);
        });
    });

    describe('findAll', () => {
        it('returns all categories of the user', async () => {
            const user = await createUser(db);
            const userCategories = [
                await createCategory(db, user.id, 'I'),
                await createCategory(db, user.id, 'E'),
            ];

            const categories = await service.findAll(user.id);

            expect(categories).toHaveLength(2);
            expect(categories).toEqual(expect.arrayContaining(userCategories));
        });

        it('returns an empty list when the user has no categories', async () => {
            const user = await createUser(db);

            await expect(service.findAll(user.id)).resolves.toEqual([]);
        });

        it('returns only the categories belonging to the user', async () => {
            const user = await createUser(db);
            const userCategory = await createCategory(db, user.id, 'I');

            const other = await createUser(db);
            await createCategory(db, other.id, 'I');

            await expect(service.findAll(user.id)).resolves.toEqual([
                userCategory,
            ]);
        });

        it('orders the categories by type and name', async () => {
            const user = await createUser(db);

            await createCategory(db, user.id, 'I', 'Salary');
            await createCategory(db, user.id, 'I', 'Investments');
            await createCategory(db, user.id, 'E', 'Housing');
            await createCategory(db, user.id, 'E', 'Food');

            expect(
                (await service.findAll(user.id)).map(({ type, name }) => ({
                    type,
                    name,
                })),
            ).toEqual([
                { type: 'I', name: 'Investments' },
                { type: 'I', name: 'Salary' },
                { type: 'E', name: 'Food' },
                { type: 'E', name: 'Housing' },
            ]);
        });
    });

    describe('create', () => {
        it.for(['I', 'E'] satisfies EntryType[])(
            'successfully creates a category for a user',
            async (type) => {
                const user = await createUser(db);

                const created = await service.create(user.id, {
                    type,
                    name: 'New Category',
                });

                await expect(findCategory(db, created.id)).resolves.toEqual(
                    created,
                );
            },
        );

        it('allows categories with the same name when their types differ', async () => {
            const user = await createUser(db);
            const income = await createCategory(db, user.id, 'I', 'Other');

            const expense = await service.create(user.id, {
                type: 'E',
                name: 'Other',
            });

            expect(expense.id).not.toBe(income.id);
            expect(expense).toMatchObject({
                userId: user.id,
                type: 'E',
                name: 'Other',
            });
        });

        it('allows different users to create categories with the same name and type', async () => {
            const user = await createUser(db);
            await createCategory(db, user.id, 'E', 'Food');

            const otherUser = await createUser(db);

            await expect(
                service.create(otherUser.id, {
                    type: 'E',
                    name: 'Food',
                }),
            ).resolves.toMatchObject({
                userId: otherUser.id,
                type: 'E',
                name: 'Food',
            });
        });

        it('throws CategoryAlreadyExistsError when creating category with same name and type', async () => {
            const user = await createUser(db);
            await createCategory(db, user.id, 'E', 'Food');

            await expect(
                service.create(user.id, { type: 'E', name: 'Food' }),
            ).rejects.toThrow(CategoryAlreadyExistsError);
        });
    });

    describe('update', () => {
        it('successfully updates category data', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I', 'Salary');

            const updated = await service.update(user.id, category.id, {
                type: 'E',
                name: 'Food',
            });

            expect(updated).toMatchObject({ type: 'E', name: 'Food' });
            await expect(findCategory(db, category.id)).resolves.toEqual(
                updated,
            );
        });

        it('throws CategoryAlreadyExistsError when updating to an existing name and type', async () => {
            const user = await createUser(db);
            await createCategory(db, user.id, 'E', 'Food');

            const category = await createCategory(db, user.id, 'E', 'Housing');

            await expect(
                service.update(user.id, category.id, { name: 'Food' }),
            ).rejects.toThrow(CategoryAlreadyExistsError);

            await expect(findCategory(db, category.id)).resolves.toEqual(
                category,
            );
        });

        it('throws CategoryNotFoundError when the category does not exist', async () => {
            const user = await createUser(db);

            await expect(
                service.update(user.id, 99, { name: 'Housing' }),
            ).rejects.toThrow(CategoryNotFoundError);
        });

        it('throws CategoryNotFoundError when the user does not own the category', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I', 'Salary');

            const other = await createUser(db);

            await expect(
                service.update(other.id, category.id, { name: 'Investments' }),
            ).rejects.toThrow(CategoryNotFoundError);
        });

        it('throws CategoryIsSystemError when the category is a system category', async () => {
            const user = await createUser(db);
            const systemCategory = await createCategory(
                db,
                user.id,
                'I',
                'System Category',
                true,
            );

            await expect(
                service.update(user.id, systemCategory.id, {
                    name: 'Cannot Change',
                }),
            ).rejects.toThrow(CategoryIsSystemError);

            await expect(findCategory(db, systemCategory.id)).resolves.toEqual(
                systemCategory,
            );
        });

        it('throws CategoryInUseError when changing the type of a category in use', async () => {
            const user = await createUser(db);
            const account = await createAccount(db, user.id);
            const category = await createCategory(db, user.id, 'I');
            await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'I',
            );

            await expect(
                service.update(user.id, category.id, { type: 'E' }),
            ).rejects.toThrow(CategoryInUseError);

            await expect(findCategory(db, category.id)).resolves.toEqual(
                category,
            );
        });
    });

    describe('delete', () => {
        it('successfully deletes a category', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'E');

            await expect(
                service.delete(user.id, category.id),
            ).resolves.toBeUndefined();

            await expect(
                findCategory(db, category.id),
            ).resolves.toBeUndefined();
        });

        it('throws CategoryNotFoundError when the category does not exist', async () => {
            const user = await createUser(db);

            await expect(service.delete(user.id, 99)).rejects.toThrow(
                CategoryNotFoundError,
            );
        });

        it('throws CategoryNotFoundError when the user does not own the category', async () => {
            const user = await createUser(db);
            const other = await createUser(db);
            const userCategory = await createCategory(db, user.id, 'E');

            await expect(
                service.delete(other.id, userCategory.id),
            ).rejects.toThrow(CategoryNotFoundError);

            await expect(findCategory(db, userCategory.id)).resolves.toEqual(
                userCategory,
            );
        });

        it('throws CategoryIsSystemError when the category is a system category', async () => {
            const user = await createUser(db);
            const systemCategory = await createCategory(
                db,
                user.id,
                'I',
                'System Category',
                true,
            );

            await expect(
                service.delete(user.id, systemCategory.id),
            ).rejects.toThrow(CategoryIsSystemError);

            await expect(findCategory(db, systemCategory.id)).resolves.toEqual(
                systemCategory,
            );
        });

        it('throws CategoryInUseError when deleting a category in use', async () => {
            const user = await createUser(db);
            const account = await createAccount(db, user.id);
            const category = await createCategory(db, user.id, 'I');
            await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'I',
            );

            await expect(service.delete(user.id, category.id)).rejects.toThrow(
                CategoryInUseError,
            );

            await expect(findCategory(db, category.id)).resolves.toEqual(
                category,
            );
        });
    });

    describe('setActive', () => {
        it('successfully updates category active status', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I');

            await expect(
                service.setActive(user.id, category.id, false),
            ).resolves.toMatchObject({ active: false });

            await expect(findCategory(db, category.id)).resolves.toMatchObject({
                active: false,
            });
        });

        it('successfully reactivates an inactive category', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I');

            await service.setActive(user.id, category.id, false);

            await expect(
                service.setActive(user.id, category.id, true),
            ).resolves.toMatchObject({ active: true });

            await expect(findCategory(db, category.id)).resolves.toMatchObject({
                active: true,
            });
        });

        it('throws CategoryNotFoundError when the category does not exist', async () => {
            const user = await createUser(db);

            await expect(service.setActive(user.id, 99, true)).rejects.toThrow(
                CategoryNotFoundError,
            );
        });

        it('throws CategoryNotFoundError when the user does not own the category', async () => {
            const user = await createUser(db);
            const other = await createUser(db);
            const category = await createCategory(db, user.id, 'E');

            await expect(
                service.setActive(other.id, category.id, false),
            ).rejects.toThrow(CategoryNotFoundError);

            await expect(findCategory(db, category.id)).resolves.toMatchObject({
                active: true,
            });
        });

        it.for([true, false])(
            'throws CategoryIsSystemError when the category is a system category',
            async (active) => {
                const user = await createUser(db);
                const systemCategory = await createCategory(
                    db,
                    user.id,
                    'I',
                    'System Category',
                    true,
                );

                await expect(
                    service.setActive(user.id, systemCategory.id, active),
                ).rejects.toThrow(CategoryIsSystemError);

                await expect(
                    findCategory(db, systemCategory.id),
                ).resolves.toMatchObject({
                    active: true,
                });
            },
        );
    });

    describe('createSystemCategories', () => {});
});
