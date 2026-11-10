import { Inject, Injectable } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';

import { DATABASE } from '../database/database.constants.ts';
import type {
    Database,
    DbExecutor,
    Transaction,
} from '../database/database.types.ts';
import { isForeignKeyViolation } from '../database/database.utils.ts';
import { transactionsTable } from '../transactions/transactions.schema.ts';
import { transfersTable } from '../transfers/transfers.schema.ts';
import type { CreateAccountDto, UpdateAccountDto } from './accounts.dto.ts';
import {
    AccountHasMovementsError,
    AccountInUseError,
    AccountNotFoundError,
} from './accounts.exceptions.ts';
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
     * @throws AccountHasMovementsError If the account already has movements.
     */
    async update(
        userId: number,
        accountId: number,
        data: UpdateAccountDto,
    ): Promise<Account> {
        if (data.startDate == undefined && data.initialBalance == undefined) {
            return await this.applyUpdate(this.db, userId, accountId, data);
        }

        return await this.db.transaction(async (tx: Transaction) => {
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
     * This action can't be reverted. Accounts with installments and no
     * transaction associated can't be deleted as well.
     *
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     *
     * @returns The deleted account.
     *
     * @throws AccountNotFoundError If the account does not exists.
     * @throws AccountInUseError If there are movements associated to the
     *   account.
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
            // Accounts with movements can't be deleted (RN-002).
            if (isForeignKeyViolation(error)) {
                throw new AccountInUseError(accountId);
            }

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

    /**
     * Effectively update the account data.
     *
     * @private
     *
     * @param executor Database or transaction executor.
     * @param userId User owner of the account.
     * @param accountId Account identifier.
     * @param data The data of the account to update.
     *
     * @returns The updated account.
     *
     * @throws AccountNotFoundError If the account does not exists.
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
     * @private
     *
     * @param executor Database or transaction executor.
     * @param accountId Account identifier.
     *
     * @throws AccountNotFoundError If the account does not exists.
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
}
