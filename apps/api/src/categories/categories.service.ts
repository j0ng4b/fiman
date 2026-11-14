import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import type { Database, DbExecutor } from '../database/database.types.ts';
import { DATABASE } from '../database/database.constants.ts';
import {
    isForeignKeyViolation,
    isUniqueViolation,
} from '../database/database.utils.ts';

import type { CreateCategoryDto, UpdateCategoryDto } from './categories.dto.ts';
import type { Category } from './categories.schema.ts';
import { SYSTEM_CATEGORIES } from './categories.constants.ts';
import {
    CategoryAlreadyExistsError,
    CategoryInUseError,
    CategoryIsSystemError,
    CategoryNotFoundError,
} from './categories.exceptions.ts';
import { categoriesTable } from './categories.schema.ts';

@Injectable()
export class CategoriesService {
    constructor(@Inject(DATABASE) private readonly db: Database) {}

    /**
     * Find a category by its ID.
     *
     * @param userId User owner of the category.
     * @param categoryId Category identifier.
     *
     * @returns The requested category.
     *
     * @throws CategoryNotFoundError If the category does not exist.
     */
    async findById(userId: number, categoryId: number): Promise<Category> {
        const [category] = await this.db
            .select()
            .from(categoriesTable)
            .where(
                and(
                    eq(categoriesTable.id, categoryId),
                    eq(categoriesTable.userId, userId),
                ),
            );

        if (!category) {
            throw new CategoryNotFoundError(categoryId);
        }

        return category;
    }

    /**
     * Retrieve the categories of a user.
     *
     * @param userId User owner of the categories.
     *
     * @returns The matching categories, ordered by type and name.
     */
    async findAll(userId: number): Promise<Category[]> {
        return await this.db
            .select()
            .from(categoriesTable)
            .where(eq(categoriesTable.userId, userId))
            .orderBy(categoriesTable.type, categoriesTable.name);
    }

    /**
     * Create a category.
     *
     * @param userId User owner of the category.
     * @param dto Data used to create the category.
     *
     * @returns The newly created category.
     *
     * @throws CategoryAlreadyExistsError If the user already has a category
     *   with this name and type.
     */
    async create(userId: number, dto: CreateCategoryDto): Promise<Category> {
        try {
            const [category] = await this.db
                .insert(categoriesTable)
                .values({ ...dto, userId })
                .returning();

            if (!category) {
                throw new Error('Insert did not return a row');
            }

            return category;
        } catch (error) {
            if (isUniqueViolation(error)) {
                throw new CategoryAlreadyExistsError(dto.name, dto.type);
            }

            throw error;
        }
    }

    /**
     * Update the name and/or the type of a category.
     *
     * The type can only change while nothing references the category: the
     * composite foreign keys of transactions and installments enforce that.
     *
     * @param userId User owner of the category.
     * @param categoryId Category identifier.
     * @param dto Data to update.
     *
     * @returns The updated category.
     *
     * @throws CategoryNotFoundError If the category does not exist.
     * @throws CategoryIsSystemError If it is a system category.
     * @throws CategoryInUseError If the type changes while the category is
     *   referenced by transactions or installments.
     * @throws CategoryAlreadyExistsError If another category already has the
     *   resulting name and type.
     */
    async update(
        userId: number,
        categoryId: number,
        dto: UpdateCategoryDto,
    ): Promise<Category> {
        let category: Category | undefined;

        try {
            [category] = await this.db
                .update(categoriesTable)
                .set(dto)
                .where(this.modifiable(userId, categoryId))
                .returning();
        } catch (error) {
            if (isUniqueViolation(error)) {
                // The DTO may carry only one of the two fields.
                const current = await this.findById(userId, categoryId);
                throw new CategoryAlreadyExistsError(
                    dto.name ?? current.name,
                    dto.type ?? current.type,
                );
            }

            // Only the type change can violate a foreign key here.
            if (isForeignKeyViolation(error)) {
                throw new CategoryInUseError(categoryId);
            }

            throw error;
        }

        if (!category) {
            throw await this.whyNotModified(userId, categoryId, 'update');
        }

        return category;
    }

    /**
     * Enable or disable a category.
     *
     * @param userId User owner of the category.
     * @param categoryId Category identifier.
     * @param active Whether the category should be active.
     *
     * @returns The updated category.
     *
     * @throws CategoryNotFoundError If the category does not exist.
     * @throws CategoryIsSystemError If it is a system category.
     */
    async setActive(
        userId: number,
        categoryId: number,
        active: boolean,
    ): Promise<Category> {
        const [category] = await this.db
            .update(categoriesTable)
            .set({ active })
            .where(this.modifiable(userId, categoryId))
            .returning();

        if (!category) {
            throw await this.whyNotModified(
                userId,
                categoryId,
                active ? 'enable' : 'disable',
            );
        }

        return category;
    }

    /**
     * Delete a category. This action can't be reverted.
     *
     * @param userId User owner of the category.
     * @param categoryId Category identifier.
     *
     * @returns The deleted category.
     *
     * @throws CategoryNotFoundError If the category does not exist.
     * @throws CategoryIsSystemError If it is a system category.
     * @throws CategoryInUseError If transactions or installments use it.
     *
     * @see setActive
     */
    async delete(userId: number, categoryId: number): Promise<Category> {
        let category: Category | undefined;

        try {
            [category] = await this.db
                .delete(categoriesTable)
                .where(this.modifiable(userId, categoryId))
                .returning();
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw new CategoryInUseError(categoryId);
            }

            throw error;
        }

        if (!category) {
            throw await this.whyNotModified(userId, categoryId, 'delete');
        }

        return category;
    }

    /**
     * Create the default categories of a new user.
     *
     * Call it with the transaction that creates the user, so both are persisted
     * together or not at all.
     *
     * @param userId User that receives the categories.
     * @param executor Database or transaction executor.
     */
    async createSystemCategories(
        userId: number,
        executor: DbExecutor = this.db,
    ): Promise<void> {
        await executor.insert(categoriesTable).values(
            SYSTEM_CATEGORIES.map((category) => ({
                userId,
                ...category,
                isSystem: true,
            })),
        );
    }

    /**
     * Matches the category only when it exists, is the user's and is not a
     * system one.
     */
    private modifiable(userId: number, categoryId: number) {
        return and(
            eq(categoriesTable.id, categoryId),
            eq(categoriesTable.userId, userId),
            eq(categoriesTable.isSystem, false),
        );
    }

    /**
     * Explains why a write matched no row: the category does not exist, or it
     * exists but is a system one (the only rows `modifiable` excludes).
     */
    private async whyNotModified(
        userId: number,
        categoryId: number,
        action: CategoryIsSystemError['action'],
    ): Promise<CategoryNotFoundError | CategoryIsSystemError> {
        const [existing] = await this.db
            .select({ id: categoriesTable.id })
            .from(categoriesTable)
            .where(
                and(
                    eq(categoriesTable.id, categoryId),
                    eq(categoriesTable.userId, userId),
                ),
            );

        return existing
            ? new CategoryIsSystemError(categoryId, action)
            : new CategoryNotFoundError(categoryId);
    }
}
