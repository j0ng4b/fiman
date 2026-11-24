import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';

import type {
    Database,
    DbExecutor,
    DbTransaction,
} from '../database/database.types.ts';
import { today } from '../common/dates.ts';
import { DATABASE } from '../database/database.constants.ts';
import { isForeignKeyViolation } from '../database/database.utils.ts';
import { transactionsTable } from '../transactions/transactions.schema.ts';
import { transfersTable } from '../transfers/transfers.schema.ts';

import type { CreateAccountDto, UpdateAccountDto } from './accounts.dto.ts';
import type { Account } from './accounts.schema.ts';
import {
    AccountHasMovementsError,
    AccountInUseError,
    AccountNotFoundError,
    InvalidAccountStartDateError,
} from './accounts.exceptions.ts';
import { accountsTable } from './accounts.schema.ts';

@Injectable()
export class AccountsService {
    private readonly logger = new Logger(AccountsService.name);

    constructor(@Inject(DATABASE) private readonly db: Database) {}

    /**
     * Find an account by its ID.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     *
     * @returns The requested account.
     *
     * @throws AccountNotFoundError If the account does not exist or does not
     *   belong to the user.
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
     * Retrieve all accounts belonging to a user.
     *
     * @param userId User owner of the accounts.
     *
     * @returns All accounts belonging to the user, ordered by ID.
     */
    async findAll(userId: number): Promise<Account[]> {
        return await this.db
            .select()
            .from(accountsTable)
            .where(eq(accountsTable.userId, userId))
            .orderBy(accountsTable.id);
    }

    /**
     * Create a new account.
     *
     * @param userId User owner of the account.
     * @param data Data used to create the account.
     *
     * @returns The newly created account.
     *
     * @throws InvalidAccountStartDateError If the date is in the future.
     */
    async create(userId: number, data: CreateAccountDto): Promise<Account> {
        // RN-004: the start date defaults to today and can't be in future.
        const startDate = data.startDate ?? today();
        this.assertStartDateNotInFuture(startDate);

        const [account] = await this.db
            .insert(accountsTable)
            .values({ ...data, userId, startDate })
            .returning();

        if (!account) {
            throw new Error('Insert did not return a row');
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
     * @throws AccountNotFoundError If the account does not exist or does not
     *   belong to the user.
     * @throws AccountHasMovementsError If the account already has movements.
     * @throws InvalidAccountStartDateError If the date is in the future.
     */
    async update(
        userId: number,
        accountId: number,
        data: UpdateAccountDto,
    ): Promise<Account> {
        if (data.startDate !== undefined) {
            // Start date can't be in future (RN-004).
            this.assertStartDateNotInFuture(data.startDate);
        }

        if (data.startDate === undefined && data.initialBalance === undefined) {
            return await this.applyUpdate(this.db, userId, accountId, data);
        }

        return await this.db.transaction(async (tx: DbTransaction) => {
            const [locked] = await tx
                .select({ id: accountsTable.id })
                .from(accountsTable)
                .where(
                    and(
                        eq(accountsTable.id, accountId),
                        eq(accountsTable.userId, userId),
                    ),
                )
                .for('update');

            if (!locked) {
                throw new AccountNotFoundError(accountId);
            }

            // Accounts with movements can't change their startDate and
            // initialBalance (RN-006).
            if (await this.hasMovements(tx, accountId)) {
                throw new AccountHasMovementsError(accountId);
            }

            return await this.applyUpdate(tx, userId, accountId, data);
        });
    }

    /**
     * Delete an account.
     *
     * This action can't be reverted.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     *
     * @throws AccountNotFoundError If the account does not exist or does not
     *   belong to the user.
     * @throws AccountInUseError If the account has associated transactions or
     *   transfers.
     *
     * @see setActive
     */
    async delete(userId: number, accountId: number): Promise<void> {
        let account: Account | undefined;

        try {
            [account] = await this.db
                .delete(accountsTable)
                .where(
                    and(
                        eq(accountsTable.id, accountId),
                        eq(accountsTable.userId, userId),
                    ),
                )
                .returning();
        } catch (error) {
            // Accounts with movements can't be deleted (RN-002).
            if (isForeignKeyViolation(error)) {
                throw new AccountInUseError(accountId);
            }

            throw error;
        }

        if (!account) {
            throw new AccountNotFoundError(accountId);
        }
    }

    /**
     * Set the active status of an account.
     *
     * Accounts can be enabled or disabled at any time, regardless of their
     * movements.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     * @param active Whether the account should be active.
     *
     * @returns The updated account.
     *
     * @throws AccountNotFoundError If the account does not exist or does not
     *   belong to the user.
     */
    async setActive(
        userId: number,
        accountId: number,
        active: boolean,
    ): Promise<Account> {
        const [account] = await this.db
            .update(accountsTable)
            .set({ active })
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
     * Effectively update the account data.
     *
     * @param executor Database or transaction executor.
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     * @param data The data of the account to update.
     *
     * @returns The updated account.
     *
     * @throws AccountNotFoundError If the account does not exist or does not
     *   belong to the user.
     */
    private async applyUpdate(
        executor: DbExecutor,
        userId: number,
        accountId: number,
        data: UpdateAccountDto,
    ): Promise<Account> {
        const [account] = await executor
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
     * Whether the account has any movement: a transaction or a transfer, as
     * source or destination.
     *
     * @param executor Database or transaction executor.
     * @param accountId Account identifier.
     */
    private async hasMovements(
        executor: DbExecutor,
        accountId: number,
    ): Promise<boolean> {
        const [transaction] = await executor
            .select({ id: transactionsTable.id })
            .from(transactionsTable)
            .where(eq(transactionsTable.accountId, accountId))
            .limit(1);

        if (transaction) {
            return true;
        }

        const [transfer] = await executor
            .select({ id: transfersTable.id })
            .from(transfersTable)
            .where(
                or(
                    eq(transfersTable.fromAccountId, accountId),
                    eq(transfersTable.toAccountId, accountId),
                ),
            )
            .limit(1);

        return transfer !== undefined;
    }

    /**
     * Assert whether the start date is in the future.
     *
     * @param startDate Date to check.
     *
     * @throws InvalidAccountStartDateError If the date is in the future.
     */
    private assertStartDateNotInFuture(startDate: string): void {
        if (startDate > today()) {
            throw new InvalidAccountStartDateError(startDate);
        }
    }
}
