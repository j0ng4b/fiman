import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import type { Database, DbTransaction } from '../database/database.types.ts';
import { CategoriesService } from '../categories/categories.service.ts';
import { DATABASE } from '../database/database.constants.ts';

import type { CreateUserDto, UpdateUserDto } from './users.dto.ts';
import type { User } from './users.schema.ts';
import { UserNotFoundError } from './users.exceptions.ts';
import { usersTable } from './users.schema.ts';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @Inject(DATABASE) private readonly db: Database,
        private readonly categoriesService: CategoriesService,
    ) {}

    /**
     * Retrieves a user by its ID.
     *
     * @param userId - ID of the user.
     *
     * @returns The requested user.
     *
     * @throws {UserNotFoundError} - If the user does not exist.
     */
    async findById(userId: number): Promise<User> {
        const [user] = await this.db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId));

        if (!user) {
            throw new UserNotFoundError(userId);
        }

        return user;
    }

    /**
     * Retrieve all users.
     *
     * @returns All registered users ordered by id.
     */
    async findAll(): Promise<User[]> {
        return await this.db.select().from(usersTable).orderBy(usersTable.id);
    }

    /**
     * Creates a user.
     *
     * The system categories are created upon user creation.
     *
     * @param data - Data used to create the user.
     *
     * @returns The newly created user.
     */
    async create(data: CreateUserDto): Promise<User> {
        return await this.db.transaction(async (tx: DbTransaction) => {
            const [user] = await tx.insert(usersTable).values(data).returning();

            if (!user) {
                throw new Error("Insert didn't return a row.");
            }

            this.logger.log(`Creating system categories for user ${user.id}`);
            await this.categoriesService.createSystemCategories(user.id, tx);

            return user;
        });
    }

    /**
     * Update an existing user.
     *
     * @param userId - ID of the user to update.
     * @param data - Data used to update the user.
     *
     * @returns The updated user.
     *
     * @throws {UserNotFoundError} - If the user does not exist.
     */
    async update(userId: number, data: UpdateUserDto): Promise<User> {
        const [user] = await this.db
            .update(usersTable)
            .set(data)
            .where(eq(usersTable.id, userId))
            .returning();

        if (!user) {
            throw new UserNotFoundError(userId);
        }

        return user;
    }
}
