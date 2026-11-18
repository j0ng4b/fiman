import { Inject, Injectable, Logger } from '@nestjs/common';
import { and, count, eq, gte, isNull, lte, sql } from 'drizzle-orm';

import type { EntryType } from '../common/dto.ts';
import type { Page } from '../common/page.ts';
import type {
    Database,
    DbExecutor,
    DbTransaction,
} from '../database/database.types.ts';
import {
    AccountInactiveError,
    AccountNotFoundError,
} from '../accounts/accounts.exceptions.ts';
import { accountsTable } from '../accounts/accounts.schema.ts';
import {
    CategoryInactiveError,
    CategoryNotFoundError,
} from '../categories/categories.exceptions.ts';
import { categoriesTable } from '../categories/categories.schema.ts';
import { firstOfMonth, todayISO } from '../common/dates.ts';
import { DATABASE } from '../database/database.constants.ts';

import type {
    CreateTransactionDto,
    ListTransactionQuery,
    RealizeTransactionDto,
    ReverseTransactionDto,
    UpdateTransactionDto,
} from './transactions.dto.ts';
import type { Transaction } from './transactions.schema.ts';
import {
    TransactionAccountingMonthAfterDueDateError,
    TransactionAlreadyReversedError,
    TransactionBeforeAccountStartError,
    TransactionCategoryTypeMismatchError,
    TransactionDateInFutureError,
    TransactionFieldsImmutableError,
    TransactionNotEditableError,
    TransactionNotFoundError,
    TransactionNotPlannedError,
    TransactionNotRealizedError,
    TransactionReversalBeforeRealizedError,
} from './transactions.exceptions.ts';
import { transactionsTable } from './transactions.schema.ts';

const DATE_COLUMNS = {
    dueDate: transactionsTable.dueDate,
    transactionDate: transactionsTable.transactionDate,
    accountingMonth: transactionsTable.accountingMonth,
} as const;

@Injectable()
export class TransactionsService {
    private readonly logger = new Logger(TransactionsService.name);

    constructor(@Inject(DATABASE) private readonly db: Database) {}

    /**
     * Retrieves a transaction belonging to the specified user.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction to retrieve.
     *
     * @returns The requested transaction.
     *
     * @throws {TransactionNotFoundError} - If the transaction does not exist or
     *   does not belong to the user.
     */
    async findById(
        userId: number,
        transactionId: number,
    ): Promise<Transaction> {
        const [transaction] = await this.db
            .select()
            .from(transactionsTable)
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                ),
            );

        if (!transaction) {
            throw new TransactionNotFoundError(transactionId);
        }

        return transaction;
    }

    /**
     * Retrieves a page of the transactions of a user.
     *
     * @param userId - ID of the transactions owner.
     * @param query - Filters and pagination.
     *
     * @returns The requested page, ordered by the filtered date and then by ID.
     */
    async findAll(
        userId: number,
        query: ListTransactionQuery,
    ): Promise<Page<Transaction>> {
        const dateColumn = DATE_COLUMNS[query.dateField];

        const where = and(
            eq(transactionsTable.userId, userId),
            query.type !== undefined
                ? eq(transactionsTable.type, query.type)
                : undefined,
            query.status !== undefined
                ? eq(transactionsTable.status, query.status)
                : undefined,
            query.from !== undefined ? gte(dateColumn, query.from) : undefined,
            query.to !== undefined ? lte(dateColumn, query.to) : undefined,
            query.accountId !== undefined
                ? eq(transactionsTable.accountId, query.accountId)
                : undefined,
            query.categoryId !== undefined
                ? eq(transactionsTable.categoryId, query.categoryId)
                : undefined,
        );

        const [items, [counted]] = await Promise.all([
            this.db
                .select()
                .from(transactionsTable)
                .where(where)
                .orderBy(dateColumn, transactionsTable.id)
                .limit(query.limit)
                .offset(query.offset),

            this.db
                .select({ total: count() })
                .from(transactionsTable)
                .where(where),
        ]);

        return {
            items,
            total: counted.total,
            limit: query.limit,
            offset: query.offset,
        } as Page<Transaction>;
    }

    /**
     * Creates a planned or an already realized transaction.
     *
     * @param userId - ID of the user who will own the transaction.
     * @param data - Data used to create the transaction.
     *
     * @returns The newly created transaction.
     *
     * @throws {TransactionDateInFutureError} - If the realized date is later
     *   than today.
     * @throws {TransactionAccountingMonthAfterDueDateError} - If the accounting
     *   month is later than the month of the due date.
     * @throws {AccountNotFoundError} - If the account does not exist or does
     *   not belong to the user.
     * @throws {AccountInactiveError} - If the account is inactive.
     * @throws {CategoryNotFoundError} - If the category does not exist or does
     *   not belong to the user.
     * @throws {CategoryInactiveError} - If the category is inactive.
     * @throws {TransactionBeforeAccountStartError} - If the due date or the
     *   accounting month is earlier than the account start date.
     * @throws {TransactionCategoryTypeMismatchError} - If the category type
     *   does not match the transaction type.
     */
    async create(
        userId: number,
        data: CreateTransactionDto,
    ): Promise<Transaction> {
        const today = todayISO();
        const financials = this.resolveFinancials(data, today);

        // RN-012. The realized date cannot be later than today.
        if (
            financials.transactionDate !== null &&
            financials.transactionDate > today
        ) {
            throw new TransactionDateInFutureError(
                'transactionDate',
                financials.transactionDate,
            );
        }

        // RN-015. The accounting month defaults to the month of the due date
        // and cannot be later than it.
        const accountingMonth =
            data.accountingMonth ?? firstOfMonth(financials.dueDate);
        this.assertAccountingMonthNotAfterDueDate(
            accountingMonth,
            financials.dueDate,
        );

        return await this.db.transaction(async (tx: DbTransaction) => {
            const account = await this.lockAccount(tx, userId, data.accountId);

            // RN-003. Inactive accounts cannot be used in new records.
            if (!account.active) {
                throw new AccountInactiveError(data.accountId);
            }

            // RN-005. Neither the due date nor the accounting month can precede
            // the account start date.
            this.assertNotBeforeAccountStartDate(
                account.startDate,
                financials.dueDate,
                accountingMonth,
            );

            // RN-009. Without a category, use the default one of the type.
            const category =
                data.categoryId !== undefined
                    ? await this.lockCategory(tx, userId, data.categoryId)
                    : await this.lockDefaultCategory(tx, userId, data.type);

            // RN-003. Inactive categories cannot be used in new records.
            if (!category.active) {
                throw new CategoryInactiveError(category.id);
            }

            // RN-007. The category type must match the transaction type.
            if (category.type !== data.type) {
                throw new TransactionCategoryTypeMismatchError(
                    category.id,
                    data.type,
                );
            }

            const [created] = await tx
                .insert(transactionsTable)
                .values({
                    userId,
                    type: data.type,
                    status: data.status,
                    description: data.description,
                    ...financials,
                    accountingMonth,
                    accountId: data.accountId,
                    categoryId: category.id,
                })
                .returning();

            if (!created) {
                throw new Error('Insert did not return a row');
            }

            return created;
        });
    }

    /**
     * Updates a transaction.
     *
     * A planned transaction can have its description, amount, due date,
     * accounting month and category changed (RN-017). A realized one accepts
     * only description and category (RN-018). A canceled one is frozen
     * (RN-020). The type and the account never change.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction to update.
     * @param data - Fields to update.
     *
     * @returns The updated transaction.
     *
     * @throws {TransactionNotFoundError} - If the transaction does not exist or
     *   does not belong to the user.
     * @throws {TransactionNotEditableError} - If the transaction is canceled.
     * @throws {TransactionFieldsImmutableError} - If the transaction is
     *   realized and the data changes other fields than description and
     *   category.
     * @throws {TransactionAccountingMonthAfterDueDateError} - If the resulting
     *   accounting month is later than the month of the due date.
     * @throws {TransactionBeforeAccountStartError} - If the due date or the
     *   accounting month is earlier than the account start date.
     * @throws {CategoryNotFoundError} - If the new category does not exist or
     *   does not belong to the user.
     * @throws {CategoryInactiveError} - If the new category is inactive.
     * @throws {TransactionCategoryTypeMismatchError} - If the new category type
     *   does not match the transaction type.
     */
    async update(
        userId: number,
        transactionId: number,
        data: UpdateTransactionDto,
    ): Promise<Transaction> {
        return await this.db.transaction(async (tx: DbTransaction) => {
            const [current] = await tx
                .select()
                .from(transactionsTable)
                .where(
                    and(
                        eq(transactionsTable.userId, userId),
                        eq(transactionsTable.id, transactionId),
                    ),
                )
                .for('update');

            if (!current) {
                throw new TransactionNotFoundError(transactionId);
            }

            // RN-020. Canceled transactions cannot be changed.
            if (current.status === 'X') {
                throw new TransactionNotEditableError(transactionId);
            }

            // RN-018. A realized transaction only accepts description and
            // category.
            if (current.status === 'C') {
                const forbidden = Object.entries(data)
                    .filter(
                        ([field, value]) =>
                            value !== undefined &&
                            !['description', 'categoryId'].includes(field),
                    )
                    .map(([field]) => field);

                if (forbidden.length > 0) {
                    throw new TransactionFieldsImmutableError(
                        transactionId,
                        forbidden,
                    );
                }
            }

            const dueDate = data.dueDate ?? current.dueDate;
            const accountingMonth = this.resolveAccountingMonth(current, data);

            // RN-015. The accounting month defaults to the month of the due date
            // and cannot be later than it.
            this.assertAccountingMonthNotAfterDueDate(accountingMonth, dueDate);

            // RN-005. The account start date is frozen while the account has
            // transactions (RN-006) and this one exists, so no lock is needed.
            if (
                data.dueDate !== undefined ||
                data.accountingMonth !== undefined
            ) {
                const startDate = await this.findAccountStartDate(
                    tx,
                    current.accountId,
                );
                this.assertNotBeforeAccountStartDate(
                    startDate,
                    dueDate,
                    accountingMonth,
                );
            }

            if (
                data.categoryId !== undefined &&
                data.categoryId !== current.categoryId
            ) {
                const category = await this.lockCategory(
                    tx,
                    userId,
                    data.categoryId,
                );

                // RN-003. The new category must be active.
                if (!category.active) {
                    throw new CategoryInactiveError(category.id);
                }

                // RN-007. The new category must match the transaction type.
                if (category.type !== current.type) {
                    throw new TransactionCategoryTypeMismatchError(
                        category.id,
                        current.type,
                    );
                }
            }

            const [updated] = await tx
                .update(transactionsTable)
                .set({ ...data, accountingMonth, updatedAt: sql`now()` })
                .where(
                    and(
                        eq(transactionsTable.userId, userId),
                        eq(transactionsTable.id, transactionId),
                    ),
                )
                .returning();

            if (!updated) {
                throw new Error('Update did not return a row');
            }

            return updated;
        });
    }

    /**
     * Marks a planned transaction as realized.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction to realize.
     * @param data - Realized amount and, optionally, realized date (default:
     *   today).
     *
     * @returns The realized transaction.
     *
     * @throws {TransactionNotFoundError} - If the transaction does not exist or
     *   does not belong to the user.
     * @throws {TransactionDateInFutureError} - If the realized date is later
     *   than today.
     * @throws {TransactionNotPlannedError} - If the transaction is not planned.
     * @throws {TransactionBeforeAccountStartError} - If the realized date is
     *   earlier than the account start date.
     */
    async realize(
        userId: number,
        transactionId: number,
        data: RealizeTransactionDto,
    ): Promise<Transaction> {
        const today = todayISO();
        const transactionDate = data.transactionDate ?? today;

        // RN-012. The realized date cannot be later than today.
        if (transactionDate > today) {
            throw new TransactionDateInFutureError(
                'transactionDate',
                transactionDate,
            );
        }

        const { transaction: current, accountStartDate } =
            await this.findWithAccount(userId, transactionId);

        // RN-013. Only planned transactions can be realized.
        if (current.status !== 'P') {
            throw new TransactionNotPlannedError(transactionId, 'realize');
        }

        // RN-005. The account start date is frozen while the account has
        // transactions (RN-006), so reading it here needs no lock.
        if (transactionDate < accountStartDate) {
            throw new TransactionBeforeAccountStartError(
                'transactionDate',
                transactionDate,
                accountStartDate,
            );
        }

        const [realized] = await this.db
            .update(transactionsTable)
            .set({
                status: 'C',
                paidAmount: data.paidAmount,
                transactionDate,
                updatedAt: sql`now()`,
            })
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                    eq(transactionsTable.status, 'P'),
                ),
            )
            .returning();

        if (!realized) {
            throw await this.whyNotPlanned(userId, transactionId, 'realize');
        }

        return realized;
    }

    /**
     * Cancels a planned transaction.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction to cancel.
     *
     * @returns The canceled transaction.
     *
     * @throws {TransactionNotFoundError} - If the transaction does not exist or
     *   does not belong to the user.
     * @throws {TransactionNotPlannedError} - If the transaction is not planned.
     */
    async cancel(userId: number, transactionId: number): Promise<Transaction> {
        // RN-019. Only planned transactions can be canceled.
        const [canceled] = await this.db
            .update(transactionsTable)
            .set({ status: 'X', updatedAt: sql`now()` })
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                    eq(transactionsTable.status, 'P'),
                ),
            )
            .returning();

        if (!canceled) {
            throw await this.whyNotPlanned(userId, transactionId, 'cancel');
        }

        return canceled;
    }

    /**
     * Reverses a realized transaction. This operation cannot be undone.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction to reverse.
     * @param data - Reversal date. Defaults today.
     *
     * @returns The transaction with its reversal date set.
     *
     * @throws {TransactionNotFoundError} - If the transaction does not exist or
     *   does not belong to the user.
     * @throws {TransactionNotRealizedError} - If the transaction is not
     *   realized.
     * @throws {TransactionDateInFutureError} - If the reversal date is later
     *   than today.
     * @throws {TransactionAlreadyReversedError} - If the transaction has
     *   already been reversed.
     * @throws {TransactionReversalBeforeRealizedError} - If the reversal date
     *   is earlier than the realized date.
     */
    async reverse(
        userId: number,
        transactionId: number,
        data: ReverseTransactionDto,
    ): Promise<Transaction> {
        const today = todayISO();
        const reversalDate = data.reversalDate ?? today;

        if (reversalDate > today) {
            throw new TransactionDateInFutureError(
                'reversalDate',
                reversalDate,
            );
        }

        // RN-021. Every condition lives in the WHERE, so the write is atomic:
        // a realized transaction not yet reversed, with the reversal date not
        // before the realized date.
        const [reversed] = await this.db
            .update(transactionsTable)
            .set({ reversalDate, updatedAt: sql`now()` })
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                    eq(transactionsTable.status, 'C'),
                    isNull(transactionsTable.reversalDate),
                    lte(transactionsTable.transactionDate, reversalDate),
                ),
            )
            .returning();

        if (!reversed) {
            throw await this.whyNotReversed(
                userId,
                transactionId,
                reversalDate,
            );
        }

        return reversed;
    }

    /**
     * Resolves the persisted financial fields from the requested status.
     *
     * For a transaction created as realized, the realized amount and date also
     * become the planned amount and due date (RN-014).
     *
     * @param data - Data used to create the transaction.
     * @param today - Current date, used as the default realized date.
     *
     * @returns The amount, due date, paid amount and realized date to persist.
     */
    private resolveFinancials(data: CreateTransactionDto, today: string) {
        if (data.status === 'C') {
            const transactionDate = data.transactionDate ?? today;

            return {
                amount: data.paidAmount,
                dueDate: transactionDate,
                paidAmount: data.paidAmount,
                transactionDate,
            };
        }

        return {
            amount: data.amount,
            dueDate: data.dueDate,
            paidAmount: null,
            transactionDate: null,
        };
    }

    /**
     * Resolves the accounting month of an update.
     *
     * An explicit value wins. Otherwise, when the due date changes and the
     * current accounting month is the month of the current due date, it follows
     * the new due date; in any other case it is kept (RN-016).
     *
     * @param current - The transaction before the update.
     * @param data - Fields to update.
     *
     * @returns The accounting month the transaction will have.
     */
    private resolveAccountingMonth(
        current: Transaction,
        data: UpdateTransactionDto,
    ): string {
        if (data.accountingMonth !== undefined) {
            return data.accountingMonth;
        }

        if (
            data.dueDate !== undefined &&
            current.accountingMonth === firstOfMonth(current.dueDate)
        ) {
            return firstOfMonth(data.dueDate);
        }

        return current.accountingMonth;
    }

    /**
     * Retrieves a transaction together with the start date of its account.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction to retrieve.
     *
     * @returns The transaction and the start date of its account.
     *
     * @throws {TransactionNotFoundError} - If the transaction does not exist or
     *   does not belong to the user.
     */
    private async findWithAccount(userId: number, transactionId: number) {
        const [row] = await this.db
            .select({
                transaction: transactionsTable,
                accountStartDate: accountsTable.startDate,
            })
            .from(transactionsTable)
            .innerJoin(
                accountsTable,
                eq(transactionsTable.accountId, accountsTable.id),
            )
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                ),
            );

        if (!row) {
            throw new TransactionNotFoundError(transactionId);
        }

        return row;
    }

    /**
     * Retrieves the start date of an account without locking it.
     *
     * @param executor - Database or transaction executor.
     * @param accountId - ID of the account.
     *
     * @returns The account start date.
     *
     * @throws {Error} - If the account does not exist, which the foreign key of
     *   an existing transaction rules out.
     */
    private async findAccountStartDate(
        executor: DbExecutor,
        accountId: number,
    ): Promise<string> {
        const [account] = await executor
            .select({ startDate: accountsTable.startDate })
            .from(accountsTable)
            .where(eq(accountsTable.id, accountId));

        if (!account) {
            throw new Error(
                `Account ${accountId} of an existing transaction not found`,
            );
        }

        return account.startDate;
    }

    /**
     * Determines why a conditional write on a planned transaction matched no
     * row.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction that was not modified.
     * @param action - Operation that required the transaction to be planned.
     *
     * @returns The not-found or not-planned error.
     */
    private async whyNotPlanned(
        userId: number,
        transactionId: number,
        action: TransactionNotPlannedError['action'],
    ): Promise<TransactionNotFoundError | TransactionNotPlannedError> {
        const [existing] = await this.db
            .select({ id: transactionsTable.id })
            .from(transactionsTable)
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                ),
            );

        return existing
            ? new TransactionNotPlannedError(transactionId, action)
            : new TransactionNotFoundError(transactionId);
    }

    /**
     * Determines why a reversal matched no row.
     *
     * @param userId - ID of the transaction owner.
     * @param transactionId - ID of the transaction that was not reversed.
     * @param reversalDate - Requested reversal date.
     *
     * @returns The domain error matching the state of the transaction or the
     *   requested date.
     *
     * @throws {Error} - If a realized transaction has no realized date, which
     *   indicates an inconsistent persisted state.
     */
    private async whyNotReversed(
        userId: number,
        transactionId: number,
        reversalDate: string,
    ): Promise<
        | TransactionNotFoundError
        | TransactionNotRealizedError
        | TransactionAlreadyReversedError
        | TransactionReversalBeforeRealizedError
    > {
        const [row] = await this.db
            .select({
                status: transactionsTable.status,
                reversalDate: transactionsTable.reversalDate,
                transactionDate: transactionsTable.transactionDate,
            })
            .from(transactionsTable)
            .where(
                and(
                    eq(transactionsTable.userId, userId),
                    eq(transactionsTable.id, transactionId),
                ),
            );

        if (!row) {
            return new TransactionNotFoundError(transactionId);
        }

        if (row.status !== 'C') {
            return new TransactionNotRealizedError(transactionId);
        }

        if (row.reversalDate !== null) {
            return new TransactionAlreadyReversedError(transactionId);
        }

        if (row.transactionDate === null) {
            throw new Error('Realized transaction without a realized date');
        }

        return new TransactionReversalBeforeRealizedError(
            transactionId,
            reversalDate,
            row.transactionDate,
        );
    }

    /**
     * Retrieves an account with a shared row lock.
     *
     * The lock is held until the transaction ends and conflicts with the
     * updates that deactivate the account or change its start date.
     *
     * @param tx - Transaction that will hold the lock.
     * @param userId - ID of the account owner.
     * @param accountId - ID of the account to lock.
     *
     * @returns The active flag and the start date of the account.
     *
     * @throws {AccountNotFoundError} - If the account does not exist or does
     *   not belong to the user.
     */
    private async lockAccount(
        tx: DbTransaction,
        userId: number,
        accountId: number,
    ) {
        const [account] = await tx
            .select({
                active: accountsTable.active,
                startDate: accountsTable.startDate,
            })
            .from(accountsTable)
            .where(
                and(
                    eq(accountsTable.userId, userId),
                    eq(accountsTable.id, accountId),
                ),
            )
            .for('share');

        if (!account) {
            throw new AccountNotFoundError(accountId);
        }

        return account;
    }

    /**
     * Retrieves a category with a shared row lock.
     *
     * The lock is held until the transaction ends and conflicts with the
     * updates that deactivate the category or change its type.
     *
     * @param tx - Transaction that will hold the lock.
     * @param userId - ID of the category owner.
     * @param categoryId - ID of the category to lock.
     *
     * @returns The ID, type and active flag of the category.
     *
     * @throws {CategoryNotFoundError} - If the category does not exist or does
     *   not belong to the user.
     */
    private async lockCategory(
        tx: DbTransaction,
        userId: number,
        categoryId: number,
    ) {
        const [category] = await tx
            .select({
                id: categoriesTable.id,
                type: categoriesTable.type,
                active: categoriesTable.active,
            })
            .from(categoriesTable)
            .where(
                and(
                    eq(categoriesTable.userId, userId),
                    eq(categoriesTable.id, categoryId),
                ),
            )
            .for('share');

        if (!category) {
            throw new CategoryNotFoundError(categoryId);
        }

        return category;
    }

    /**
     * Retrieves, with a shared row lock, the default system category of a type.
     *
     * @param tx - Transaction that will hold the lock.
     * @param userId - ID of the category owner.
     * @param type - Transaction type (income or expense).
     *
     * @returns The ID, type and active flag of the category.
     *
     * @throws {Error} - If the user has no system category of the type. Every
     *   user is created with them, so this is a bug, not a user error.
     */
    private async lockDefaultCategory(
        tx: DbTransaction,
        userId: number,
        type: EntryType,
    ) {
        const [category] = await tx
            .select({
                id: categoriesTable.id,
                type: categoriesTable.type,
                active: categoriesTable.active,
            })
            .from(categoriesTable)
            .where(
                and(
                    eq(categoriesTable.userId, userId),
                    eq(categoriesTable.type, type),
                    eq(categoriesTable.isSystem, true),
                ),
            )
            .for('share');

        if (!category) {
            throw new Error(
                `User ${userId} has no default category of type ${type}`,
            );
        }

        return category;
    }

    /**
     * Ensures the accounting month is not later than the month of the due date.
     *
     * @param accountingMonth - Accounting month (first day of a month).
     * @param dueDate - Due date.
     *
     * @throws {TransactionAccountingMonthAfterDueDateError} - If the accounting
     *   month is later than the month of the due date.
     */
    private assertAccountingMonthNotAfterDueDate(
        accountingMonth: string,
        dueDate: string,
    ): void {
        if (accountingMonth > firstOfMonth(dueDate)) {
            throw new TransactionAccountingMonthAfterDueDateError(
                accountingMonth,
                dueDate,
            );
        }
    }

    /**
     * Ensures neither the due date nor the accounting month precedes the
     * account start date.
     *
     * @param startDate - Account start date.
     * @param dueDate - Due date.
     * @param accountingMonth - Accounting month (first day of a month).
     *
     * @throws {TransactionBeforeAccountStartError} - If the due date is earlier
     *   than the start date, or the accounting month is earlier than the month
     *   of the start date.
     */
    private assertNotBeforeAccountStartDate(
        startDate: string,
        dueDate: string,
        accountingMonth: string,
    ): void {
        if (dueDate < startDate) {
            throw new TransactionBeforeAccountStartError(
                'dueDate',
                dueDate,
                startDate,
            );
        }

        if (accountingMonth < firstOfMonth(startDate)) {
            throw new TransactionBeforeAccountStartError(
                'accountingMonth',
                accountingMonth,
                startDate,
            );
        }
    }
}
