import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE } from "../database/database.constants.ts";
import { type Database } from "../database/database.provider.ts";
import { type User, usersTable } from "./users.schema.ts";
import { type CreateUserDto, type UpdateUserDto } from "./users.dto.ts";
import { UserNotFoundError } from "./users.exceptions.ts";

@Injectable()
export class UsersService {
    constructor(@Inject(DATABASE) private readonly db: Database) {}

    /**
     * Find a user by its ID.
     *
     * @param id User identifier.
     *
     * @returns The requested user.
     *
     * @throws UserNotFoundError If the user does not exist.
     */
    async findById(id: number): Promise<User> {
        const [user] = await this.db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id));

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    /**
     * Retrieve all users.
     *
     * @returns All registered users.
     */
    async findAll(): Promise<User[]> {
        return await this.db.select().from(usersTable);
    }

    /**
     * Create a new user.
     *
     * @param dto Data used to create the user.
     *
     * @returns The newly created user.
     */
    async create(dto: CreateUserDto): Promise<User> {
        const [user] = await this.db.insert(usersTable).values(dto).returning();
        if (!user) {
            // TODO: Replace error to domain specific error
            throw new Error("Insert didn't return a row.");
        }

        return user;
    }

    /**
     * Update an existing user.
     *
     * @param id User identifier.
     * @param dto Data used to update the user.
     *
     * @returns The updated user.
     *
     * @throws UserNotFoundError If the user does not exist.
     */
    async update(id: number, dto: UpdateUserDto): Promise<User> {
        const [user] = await this.db
            .update(usersTable)
            .set(dto)
            .where(eq(usersTable.id, id))
            .returning();

        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }
}
