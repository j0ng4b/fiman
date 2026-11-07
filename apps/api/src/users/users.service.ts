import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE } from "../database/database.constants.ts";
import { type Database } from "../database/database.provider.ts";
import { type User, usersTable } from "./users.schema.ts";

@Injectable()
export class UsersService {
    constructor(@Inject(DATABASE) private readonly db: Database) {}

    /* Return a user by its ID.
     */
    async getUser(id: number): Promise<User> {
        const [user] = await this.db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);
        return user;
    }

    /* Returns all users.
     */
    async getAllUsers(): Promise<User[]> {
        return await this.db.select().from(usersTable);
    }
}
