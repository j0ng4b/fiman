import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants.ts';
import type { Database } from '../database/database.types.ts';
import type { CreateAccountDto, UpdateAccountDto } from './accounts.dto.ts';
import { AccountNotFoundError } from './accounts.exceptions.ts';
import type { Account } from './accounts.schema.ts';
import { accountsTable } from './accounts.schema.ts';

@Injectable()
export class AccountsService {
    constructor(@Inject(DATABASE) private readonly db: Database) {}

    /**
     * Find an account by its ID.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     *
     * @returns The requested account.
     *
     * @throws AccountNotFoundError If the account does not exists.
     */
    async findById(userId: number, accountId: number): Promise<Account> {
        const [account] = await this.db
            .select()
            .from(accountsTable)
            .where(
                and(
                    eq(accountsTable.id, accountId),
                    eq(accountsTable.userId, userId),
                ),
            );

        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        return account;
    }

    /**
     * Retrieve all accounts.
     *
     * @param userId User owner of the accounts.
     *
     * @returns All registered accounts.
     */
    async findAll(userId: number): Promise<Account[]> {
        return await this.db
            .select()
            .from(accountsTable)
            .where(eq(accountsTable.userId, userId));
    }

    /**
     * Create a new account.
     *
     * @param userId User owner of the account.
     * @param data Data used to create the account.
     *
     * @returns The new created account.
     */
    async create(userId: number, data: CreateAccountDto): Promise<Account> {
        // TODO: Check if initial date is less than today (RN-004).

        const [account] = await this.db
            .insert(accountsTable)
            .values({ userId, ...data })
            .returning();

        if (!account) {
            throw new Error('');
        }

        return account;
    }

    /**
     * Update an account.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     * @param data The data of the account to update.
     *
     * @returns The updated account.
     *
     * @throws AccountNotFoundError If the account does not exists.
     */
    async update(
        userId: number,
        accountId: number,
        data: UpdateAccountDto,
    ): Promise<Account> {
        // TODO: Check if there are posting to the account (RN-005) thats block
        // update initialBalance and startDate.

        const [account] = await this.db
            .update(accountsTable)
            .set(data)
            .where(
                and(
                    eq(accountsTable.id, accountId),
                    eq(accountsTable.userId, userId),
                ),
            )
            .returning();

        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        return account;
    }

    /**
     * Delete an account.
     *
     * This action can't be reverted.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     *
     * @returns The deleted account.
     *
     * @throws AccountNotFoundError If the account does not exists.
     *
     * @see disable
     */
    async delete(userId: number, accountId: number): Promise<Account> {
        try {
            const [account] = await this.db
                .delete(accountsTable)
                .where(
                    and(
                        eq(accountsTable.id, accountId),
                        eq(accountsTable.userId, userId),
                    ),
                )
                .returning();

            if (!account) {
                throw new AccountNotFoundError(accountId);
            }

            return account;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Disable an account.
     *
     * Any account can be enabled/disabled at any time.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     * @param disabled If The account should be disabled.
     *
     * @throws AccountNotFoundError If the account does not exists.
     */
    async disable(userId: number, accountId: number, disabled: boolean) {
        const [account] = await this.db
            .update(accountsTable)
            .set({ active: !disabled })
            .where(
                and(
                    eq(accountsTable.id, accountId),
                    eq(accountsTable.userId, userId),
                ),
            )
            .returning();

        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        return account;
    }
}
