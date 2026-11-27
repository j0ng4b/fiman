import type { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { inject } from 'vitest';

import type { Account } from '../../src/accounts/accounts.schema.ts';
import type { EntryType } from '../../src/common/dto.ts';
import type { Database } from '../../src/database/database.types.ts';
import type {
    TransactionDateField,
    TransactionStatus,
    UpdateTransactionDto,
} from '../../src/transactions/transactions.dto.ts';
import type { Transaction } from '../../src/transactions/transactions.schema.ts';
import type { User } from '../../src/users/users.schema.ts';
import {
    AccountInactiveError,
    AccountNotFoundError,
} from '../../src/accounts/accounts.exceptions.ts';
import {
    CategoryInactiveError,
    CategoryNotFoundError,
} from '../../src/categories/categories.exceptions.ts';
import {
    categoriesTable,
    type Category,
} from '../../src/categories/categories.schema.ts';
import { today, tomorrow } from '../../src/common/dates.ts';
import {
    TransactionAccountingMonthAfterDueDateError,
    TransactionBeforeAccountStartError,
    TransactionCategoryTypeMismatchError,
    TransactionDateInFutureError,
    TransactionFieldsImmutableError,
    TransactionNotEditableError,
    TransactionNotFoundError,
} from '../../src/transactions/transactions.exceptions.ts';
import { transactionsTable } from '../../src/transactions/transactions.schema.ts';
import { TransactionsService } from '../../src/transactions/transactions.service.ts';

import { createTestDatabase, resetDatabase } from './helpers/database.ts';
import {
    createAccount,
    createCanceledTransaction,
    createCategory,
    createPlannedTransaction,
    createRealizedTransaction,
    createUser,
} from './helpers/factories.ts';

async function findTransaction(
    db: Database,
    id: number,
): Promise<Transaction | undefined> {
    const [transaction] = await db
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.id, id));

    return transaction;
}

describe('TransactionsService', () => {
    let db: Database;
    let pool: Pool;
    let service: TransactionsService;

    beforeAll(() => {
        ({ db, pool } = createTestDatabase(inject('databaseUrl')));
        service = new TransactionsService(db);
    });

    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await resetDatabase(db);
    });

    describe('findById', () => {
        it('returns the requested transaction', async () => {
            const user = await createUser(db);
            const category = await createCategory(db, user.id, 'I');
            const account = await createAccount(db, user.id);

            const transaction = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'I',
            );

            await expect(
                service.findById(user.id, transaction.id),
            ).resolves.toEqual(transaction);
        });

        it('throws TransactionNotFoundError when the transaction does not exist', async () => {
            const user = await createUser(db);

            await expect(service.findById(user.id, 99)).rejects.toThrow(
                TransactionNotFoundError,
            );
        });

        it('throws TransactionNotFoundError when the user does not own the transaction', async () => {
            const user = await createUser(db);
            const other = await createUser(db);
            const category = await createCategory(db, user.id, 'I');
            const account = await createAccount(db, user.id);

            const transaction = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'I',
            );

            await expect(
                service.findById(other.id, transaction.id),
            ).rejects.toThrow(TransactionNotFoundError);
        });
    });

    describe('findAll', () => {
        let user: User;
        let category: Category;
        let account: Account;

        beforeEach(async () => {
            user = await createUser(db);
            category = await createCategory(db, user.id, 'E');
            account = await createAccount(db, user.id);
        });

        it('returns all transactions of the user', async () => {
            let transactions: Transaction[] = [];
            for (let i = 0; i < 2; i++) {
                transactions.push(
                    await createPlannedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    ),
                );

                transactions.push(
                    await createRealizedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    ),
                );
            }

            const result = await service.findAll(user.id, {
                dateField: 'dueDate',
                limit: 10,
                offset: 0,
            });

            expect(result).toEqual({
                total: 4,
                limit: 10,
                offset: 0,
                items: expect.arrayContaining(transactions),
            });
            expect(result.items).toHaveLength(4);
        });

        it('returns an empty list when the user has no transactions', async () => {
            await expect(
                service.findAll(user.id, {
                    dateField: 'dueDate',
                    limit: 10,
                    offset: 0,
                }),
            ).resolves.toEqual({ total: 0, items: [], limit: 10, offset: 0 });
        });

        it('returns only the transactions belonging to the user', async () => {
            const userTransaction = await createRealizedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
            );

            const other = await createUser(db);
            const otherCategory = await createCategory(db, other.id, 'I');
            const otherAccount = await createAccount(db, other.id);
            await createPlannedTransaction(
                db,
                other.id,
                otherAccount.id,
                otherCategory.id,
                'I',
            );

            await expect(
                service.findAll(user.id, {
                    dateField: 'dueDate',
                    limit: 10,
                    offset: 0,
                }),
            ).resolves.toEqual({
                total: 1,
                items: [userTransaction],
                limit: 10,
                offset: 0,
            });
        });

        describe('filters', () => {
            it.for(['I', 'E'] as const satisfies readonly EntryType[])(
                'respects the type %s filter',
                async (type: EntryType) => {
                    const income = await createPlannedTransaction(
                        db,
                        user.id,
                        account.id,
                        (await createCategory(db, user.id, 'I')).id,
                        'I',
                    );

                    const expense = await createPlannedTransaction(
                        db,
                        user.id,
                        account.id,
                        (await createCategory(db, user.id, 'E')).id,
                        'E',
                    );

                    await expect(
                        service.findAll(user.id, {
                            dateField: 'dueDate',
                            limit: 10,
                            offset: 0,
                            type,
                        }),
                    ).resolves.toEqual({
                        total: 1,
                        limit: 10,
                        offset: 0,
                        items: [type === 'I' ? income : expense],
                    });
                },
            );

            it.for([
                'P',
                'X',
                'C',
            ] as const satisfies readonly TransactionStatus[])(
                'respects the status %s filter',
                async (status) => {
                    const planned = await createPlannedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    );

                    const canceled = await createCanceledTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    );

                    const realized = await createRealizedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                    );

                    await expect(
                        service.findAll(user.id, {
                            dateField: 'dueDate',
                            limit: 10,
                            offset: 0,
                            status,
                        }),
                    ).resolves.toEqual({
                        total: 1,
                        limit: 10,
                        offset: 0,
                        items: [
                            status === 'P'
                                ? planned
                                : status === 'X'
                                  ? canceled
                                  : realized,
                        ],
                    });
                },
            );

            it('respects the from date filter', async () => {
                // before
                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-09',
                );

                const boundary = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-10',
                );

                const after = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-11',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 10,
                        offset: 0,
                        from: '2026-12-10',
                    }),
                ).resolves.toEqual({
                    total: 2,
                    limit: 10,
                    offset: 0,
                    items: [boundary, after],
                });
            });

            it('respects the to date filter', async () => {
                const before = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-09',
                );

                const boundary = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-10',
                );

                // after
                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-11',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 10,
                        offset: 0,
                        to: '2026-12-10',
                    }),
                ).resolves.toEqual({
                    total: 2,
                    limit: 10,
                    offset: 0,
                    items: [before, boundary],
                });
            });

            it('respects the accountId filter', async () => {
                await createRealizedTransaction(
                    db,
                    user.id,
                    // A second account
                    (await createAccount(db, user.id)).id,
                    category.id,
                    'E',
                );

                const transaction = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 10,
                        offset: 0,
                        accountId: account.id,
                    }),
                ).resolves.toEqual({
                    total: 1,
                    limit: 10,
                    offset: 0,
                    items: [transaction],
                });
            });

            it('respects the categoryId filter', async () => {
                await createCanceledTransaction(
                    db,
                    user.id,
                    account.id,
                    // A second category
                    (await createCategory(db, user.id, 'I')).id,
                    'I',
                );

                const transaction = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 10,
                        offset: 0,
                        categoryId: category.id,
                    }),
                ).resolves.toEqual({
                    total: 1,
                    limit: 10,
                    offset: 0,
                    items: [transaction],
                });
            });

            it.for([
                'dueDate',
                'transactionDate',
                'accountingMonth',
            ] as const satisfies readonly TransactionDateField[])(
                'filters by the selected date field (%s)',
                async (dateField) => {
                    const dueDate = await createPlannedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                        10_00,
                        '2026-11-04',
                    );

                    const transactionDate = await createRealizedTransaction(
                        db,
                        user.id,
                        account.id,
                        category.id,
                        'E',
                        1_00,
                        1_00,
                        '2026-11-05',
                        '2026-11-04',
                    );

                    const expectedItems =
                        dateField === 'dueDate'
                            ? [dueDate, transactionDate]
                            : dateField === 'transactionDate'
                              ? [transactionDate]
                              : [];

                    await expect(
                        service.findAll(user.id, {
                            dateField,
                            limit: 10,
                            offset: 0,
                            from: '2026-11-04',
                        }),
                    ).resolves.toEqual({
                        total: expectedItems.length,
                        limit: 10,
                        offset: 0,
                        items: expectedItems,
                    });
                },
            );

            it('combines filters cumulatively', async () => {
                const matching = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                );

                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    (await createCategory(db, user.id, 'I')).id,
                    'I',
                );

                await createCanceledTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 10,
                        offset: 0,
                        type: 'E',
                        status: 'P',
                    }),
                ).resolves.toEqual({
                    total: 1,
                    limit: 10,
                    offset: 0,
                    items: [matching],
                });
            });
        });

        it('orders transactions by date and then by ID', async () => {
            const later = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
                1_00,
                '2026-12-11',
            );

            const firstOnDate = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
                1_00,
                '2026-12-09',
            );

            const secondOnDate = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
                1_00,
                '2026-12-09',
            );

            const middle = await createPlannedTransaction(
                db,
                user.id,
                account.id,
                category.id,
                'E',
                1_00,
                '2026-12-10',
            );

            await expect(
                service.findAll(user.id, {
                    dateField: 'dueDate',
                    limit: 10,
                    offset: 0,
                }),
            ).resolves.toMatchObject({
                items: [firstOnDate, secondOnDate, middle, later],
            });
        });

        describe('page', () => {
            it('returns a page of transactions', async () => {
                const third = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-11',
                );

                // first
                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-09',
                );

                // fourth
                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-12',
                );

                const second = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                    1_00,
                    '2026-12-10',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 2,
                        offset: 1,
                    }),
                ).resolves.toEqual({
                    total: 4,
                    limit: 2,
                    offset: 1,
                    items: [second, third],
                });
            });

            it('returns an empty page when offset exceeds the total', async () => {
                await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    category.id,
                    'E',
                );

                await expect(
                    service.findAll(user.id, {
                        dateField: 'dueDate',
                        limit: 10,
                        offset: 5,
                    }),
                ).resolves.toEqual({
                    total: 1,
                    limit: 10,
                    offset: 5,
                    items: [],
                });
            });
        });
    });

    describe('create', () => {
        let user: User;
        let incomeCategory: Category;
        let expenseCategory: Category;
        let account: Account;

        beforeEach(async () => {
            user = await createUser(db);
            incomeCategory = await createCategory(db, user.id, 'I');
            expenseCategory = await createCategory(db, user.id, 'E');
            account = await createAccount(db, user.id);
        });

        it('creates a planned transaction', async () => {
            const nextDate = tomorrow();
            const created = await service.create(user.id, {
                type: 'E',
                status: 'P',
                amount: 155_00,
                dueDate: nextDate,
                description: 'Dinner',
                accountId: account.id,
                categoryId: expenseCategory.id,
            });

            expect(created).toMatchObject({
                userId: user.id,

                type: 'E',
                status: 'P',
                amount: 155_00,
                dueDate: nextDate,
                description: 'Dinner',
                accountId: account.id,
                categoryId: expenseCategory.id,

                paidAmount: null,
                transactionDate: null,
            });

            await expect(findTransaction(db, created.id)).resolves.toEqual(
                created,
            );
        });

        it('creates a realized transaction', async () => {
            const created = await service.create(user.id, {
                type: 'I',
                status: 'C',
                paidAmount: 1000_00,
                transactionDate: '2026-11-11',
                description: 'Salary',
                accountId: account.id,
                categoryId: incomeCategory.id,
            });

            expect(created).toMatchObject({
                userId: user.id,

                type: 'I',
                status: 'C',
                paidAmount: 1000_00,
                transactionDate: '2026-11-11',
                description: 'Salary',
                accountId: account.id,
                categoryId: incomeCategory.id,

                amount: 1000_00,
                dueDate: '2026-11-11',
            });

            await expect(findTransaction(db, created.id)).resolves.toEqual(
                created,
            );
        });

        describe('defaults', () => {
            it('defaults accountingMonth to the first day of dueDate month when omitted', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'P',
                        amount: 50_00,
                        dueDate: '2025-06-28',
                        description: 'Found behind the sofa',
                        accountId: account.id,
                        categoryId: incomeCategory.id,
                    }),
                ).resolves.toMatchObject({
                    accountingMonth: '2025-06-01',
                });
            });

            it('uses transactionDate as dueDate for realized transactions', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'E',
                        status: 'C',
                        paidAmount: 10_00,
                        transactionDate: '2026-09-30',
                        description: 'Ticket star park',
                        accountId: account.id,
                        categoryId: expenseCategory.id,
                    }),
                ).resolves.toMatchObject({
                    dueDate: '2026-09-30',
                });
            });

            it('defaults transactionDate to today when omitted', async () => {
                const date = today();
                await expect(
                    service.create(user.id, {
                        type: 'E',
                        status: 'C',
                        paidAmount: 99_00,
                        description: 'Grand shiT Agame 6',
                        accountId: account.id,
                        categoryId: expenseCategory.id,
                    }),
                ).resolves.toMatchObject({
                    transactionDate: date,
                    dueDate: date,
                });
            });

            it.for(['I', 'E'] as const satisfies readonly EntryType[])(
                'uses the default category for the transaction type (%s)',
                async (type) => {
                    const defaultCategory = await createCategory(
                        db,
                        user.id,
                        type,
                        `Default ${type} category`,
                        true,
                    );

                    await expect(
                        service.create(user.id, {
                            type,
                            status: 'P',
                            amount: 50_00,
                            dueDate: '2025-06-28',
                            description: 'Found behind the sofa',
                            accountId: account.id,
                        }),
                    ).resolves.toMatchObject({
                        categoryId: defaultCategory.id,
                    });
                },
            );
        });

        describe('rules', () => {
            it('rejects a transaction with a future transaction date', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        transactionDate: tomorrow(),
                        description: 'Testing rules',
                        accountId: account.id,
                        categoryId: incomeCategory.id,
                    }),
                ).rejects.toThrow(TransactionDateInFutureError);
            });

            it('rejects a transaction with an accounting month after its due date month', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'E',
                        status: 'P',
                        amount: 1_00,
                        dueDate: '2023-01-05',
                        description: 'Testing rules',
                        accountingMonth: '2026-02-01',
                        accountId: account.id,
                        categoryId: expenseCategory.id,
                    }),
                ).rejects.toThrow(TransactionAccountingMonthAfterDueDateError);
            });

            it('rejects a transaction when the account does not exist', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        description: 'Testing rules',
                        accountId: 99,
                        categoryId: incomeCategory.id,
                    }),
                ).rejects.toThrow(AccountNotFoundError);
            });

            it('rejects a transaction when the account belongs to another user', async () => {
                const other = await createUser(db);
                const otherAccount = await createAccount(db, other.id);

                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        description: 'Testing rules',
                        accountId: otherAccount.id,
                        categoryId: incomeCategory.id,
                    }),
                ).rejects.toThrow(AccountNotFoundError);
            });

            it('rejects a transaction using an inactive account', async () => {
                const inactiveAccount = await createAccount(
                    db,
                    user.id,
                    'Inactive account',
                    0,
                    '2000-01-01',
                    false,
                );

                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        description: 'Testing rules',
                        accountId: inactiveAccount.id,
                        categoryId: incomeCategory.id,
                    }),
                ).rejects.toThrow(AccountInactiveError);
            });

            it('rejects a transaction when the category does not exist', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        description: 'Testing rules',
                        accountId: account.id,
                        categoryId: 99,
                    }),
                ).rejects.toThrow(CategoryNotFoundError);
            });

            it('rejects a transaction when the category belongs to another user', async () => {
                const other = await createUser(db);
                const otherCategory = await createCategory(db, other.id, 'I');

                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        description: 'Testing rules',
                        accountId: account.id,
                        categoryId: otherCategory.id,
                    }),
                ).rejects.toThrow(CategoryNotFoundError);
            });

            it('rejects a transaction using an inactive category', async () => {
                const inactiveCategory = await createCategory(
                    db,
                    user.id,
                    'E',
                    'Inactive category',
                    false,
                    false,
                );

                await expect(
                    service.create(user.id, {
                        type: 'E',
                        status: 'P',
                        amount: 1_00,
                        dueDate: '2024-07-20',
                        description: 'Testing rules',
                        accountId: account.id,
                        categoryId: inactiveCategory.id,
                    }),
                ).rejects.toThrow(CategoryInactiveError);
            });

            it('rejects a transaction with an accounting month before the account start date', async () => {
                const date = today();
                const todayAccount = await createAccount(
                    db,
                    user.id,
                    'Today account',
                    0,
                    date,
                );

                await expect(
                    service.create(user.id, {
                        type: 'E',
                        status: 'P',
                        amount: 1_00,
                        dueDate: date,
                        description: 'Testing rules',
                        accountingMonth: '2000-01-01',
                        accountId: todayAccount.id,
                        categoryId: expenseCategory.id,
                    }),
                ).rejects.toThrow(TransactionBeforeAccountStartError);
            });

            it('rejects a planned transaction with a due date before the account start date', async () => {
                const todayAccount = await createAccount(
                    db,
                    user.id,
                    'Today account',
                    0,
                    today(),
                );

                await expect(
                    service.create(user.id, {
                        type: 'E',
                        status: 'P',
                        amount: 1_00,
                        dueDate: '2000-01-01',
                        description: 'Testing rules',
                        accountId: todayAccount.id,
                        categoryId: expenseCategory.id,
                    }),
                ).rejects.toThrow(TransactionBeforeAccountStartError);
            });

            it('rejects a realized transaction dated before the account start date', async () => {
                const todayAccount = await createAccount(
                    db,
                    user.id,
                    'Today account',
                    0,
                    today(),
                );

                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        transactionDate: '2000-01-01',
                        description: 'Testing rules',
                        accountId: todayAccount.id,
                        categoryId: incomeCategory.id,
                    }),
                ).rejects.toThrow(TransactionBeforeAccountStartError);
            });

            it('rejects a transaction when the category type does not match the transaction type', async () => {
                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        description: 'Testing rules',
                        accountId: account.id,
                        categoryId: expenseCategory.id,
                    }),
                ).rejects.toThrow(TransactionCategoryTypeMismatchError);
            });

            it('accepts a realized transaction dated today', async () => {
                const date = today();

                await expect(
                    service.create(user.id, {
                        type: 'I',
                        status: 'C',
                        paidAmount: 1_00,
                        transactionDate: date,
                        description: 'Testing rules',
                        accountId: account.id,
                        categoryId: incomeCategory.id,
                    }),
                ).resolves.toMatchObject({
                    transactionDate: date,
                    dueDate: date,
                });
            });

            describe('account start date boundaries', () => {
                it('accepts a due date equal to the account start date', async () => {
                    const startAccount = await createAccount(
                        db,
                        user.id,
                        'Start account',
                        0,
                        '2026-11-15',
                    );

                    await expect(
                        service.create(user.id, {
                            type: 'E',
                            status: 'P',
                            amount: 1_00,
                            dueDate: '2026-11-15',
                            description: 'Testing rules',
                            accountId: startAccount.id,
                            categoryId: expenseCategory.id,
                        }),
                    ).resolves.toMatchObject({ dueDate: '2026-11-15' });
                });

                it('accepts a default accounting month earlier than the start date but within its month', async () => {
                    const startAccount = await createAccount(
                        db,
                        user.id,
                        'Mid-month account',
                        0,
                        '2026-11-15',
                    );

                    await expect(
                        service.create(user.id, {
                            type: 'E',
                            status: 'P',
                            amount: 1_00,
                            dueDate: '2026-11-20',
                            description: 'Testing rules',
                            accountId: startAccount.id,
                            categoryId: expenseCategory.id,
                        }),
                    ).resolves.toMatchObject({ accountingMonth: '2026-11-01' });
                });
            });
        });
    });

    describe('update', () => {
        let user: User;
        let incomeCategory: Category;
        let expenseCategory: Category;
        let account: Account;
        let transactions: {
            planned: Transaction;
            realized: Transaction;
            canceled: Transaction;
        };

        beforeEach(async () => {
            user = await createUser(db);
            incomeCategory = await createCategory(db, user.id, 'I');
            expenseCategory = await createCategory(db, user.id, 'E');
            account = await createAccount(db, user.id);

            transactions = {
                planned: await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    incomeCategory.id,
                    'I',
                ),

                realized: await createRealizedTransaction(
                    db,
                    user.id,
                    account.id,
                    expenseCategory.id,
                    'E',
                ),

                canceled: await createCanceledTransaction(
                    db,
                    user.id,
                    account.id,
                    incomeCategory.id,
                    'I',
                ),
            };
        });

        it('updates the planned transaction allowed fields', async () => {
            const newCategory = await createCategory(db, user.id, 'I');
            const updated = await service.update(
                user.id,
                transactions.planned.id,
                {
                    amount: 10_000_00,
                    dueDate: '2026-12-31',
                    description: 'New description',
                    accountingMonth: '2026-11-01',
                    categoryId: newCategory.id,
                },
            );

            expect(updated).toMatchObject({
                amount: 10_000_00,
                dueDate: '2026-12-31',
                description: 'New description',
                accountingMonth: '2026-11-01',
                categoryId: newCategory.id,
            });

            await expect(
                findTransaction(db, transactions.planned.id),
            ).resolves.toMatchObject(updated);
        });

        it('updates the realized transaction allowed fields', async () => {
            const newCategory = await createCategory(db, user.id, 'E');
            const updated = await service.update(
                user.id,
                transactions.realized.id,
                {
                    description: 'New description',
                    categoryId: newCategory.id,
                },
            );

            expect(updated).toMatchObject({
                description: 'New description',
                categoryId: newCategory.id,
            });

            await expect(
                findTransaction(db, transactions.realized.id),
            ).resolves.toMatchObject(updated);
        });

        describe('accounting month', () => {
            it('updates accountingMonth when dueDate changes and both originally belong to the same month', async () => {
                await expect(
                    service.update(user.id, transactions.planned.id, {
                        dueDate: '2027-01-03',
                    }),
                ).resolves.toMatchObject({
                    accountingMonth: '2027-01-01',
                });

                await expect(
                    findTransaction(db, transactions.planned.id),
                ).resolves.toMatchObject({
                    accountingMonth: '2027-01-01',
                });
            });

            it('preserves accountingMonth when dueDate changes and the months already differ', async () => {
                const transaction = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    incomeCategory.id,
                    'I',
                    250_00,
                    '2026-09-07',
                    'Testing accounting month',
                    '2026-08-01',
                );

                await expect(
                    service.update(user.id, transaction.id, {
                        dueDate: '2027-01-10',
                    }),
                ).resolves.toMatchObject({
                    dueDate: '2027-01-10',
                    accountingMonth: '2026-08-01',
                });

                await expect(
                    findTransaction(db, transaction.id),
                ).resolves.toMatchObject({
                    dueDate: '2027-01-10',
                    accountingMonth: '2026-08-01',
                });
            });

            it('accepts moving the due date into the month of the preserved accounting month', async () => {
                const transaction = await createPlannedTransaction(
                    db,
                    user.id,
                    account.id,
                    incomeCategory.id,
                    'I',
                    250_00,
                    '2026-09-07',
                    'Testing accounting month',
                    '2026-08-01',
                );

                await expect(
                    service.update(user.id, transaction.id, {
                        dueDate: '2026-08-20',
                    }),
                ).resolves.toMatchObject({
                    dueDate: '2026-08-20',
                    accountingMonth: '2026-08-01',
                });

                await expect(
                    findTransaction(db, transaction.id),
                ).resolves.toMatchObject({
                    dueDate: '2026-08-20',
                    accountingMonth: '2026-08-01',
                });
            });
        });

        describe('rules', () => {
            it('rejects updates to canceled transactions', async () => {
                await expect(
                    service.update(user.id, transactions.canceled.id, {
                        description: 'New description',
                    }),
                ).rejects.toThrow(TransactionNotEditableError);

                await expect(
                    findTransaction(db, transactions.canceled.id),
                ).resolves.toEqual(transactions.canceled);
            });

            it('rejects updates when the transaction does not exist', async () => {
                await expect(service.update(user.id, -1, {})).rejects.toThrow(
                    TransactionNotFoundError,
                );
            });

            it('rejects updates when the transaction belongs to another user', async () => {
                const otherUser = await createUser(db);

                await expect(
                    service.update(otherUser.id, transactions.realized.id, {
                        description: 'Should not persist anything',
                    }),
                ).rejects.toThrow(TransactionNotFoundError);

                await expect(
                    findTransaction(db, transactions.realized.id),
                ).resolves.toEqual(transactions.realized);
            });

            it.for([
                ['amount', 0],
                ['dueDate', '2026-12-10'],
                ['accountingMonth', '2026-01-01'],
            ])(
                'rejects changes to %s on realized transactions',
                async (data) => {
                    const dataToUpdate = Object.fromEntries([data]);
                    await expect(
                        service.update(
                            user.id,
                            transactions.realized.id,
                            dataToUpdate,
                        ),
                    ).rejects.toThrow(TransactionFieldsImmutableError);

                    await expect(
                        findTransaction(db, transactions.realized.id),
                    ).resolves.toEqual(transactions.realized);
                },
            );

            it('rejects an accounting month later than the due date month', async () => {
                await expect(
                    service.update(user.id, transactions.planned.id, {
                        accountingMonth: '2030-01-01',
                    }),
                ).rejects.toThrow(TransactionAccountingMonthAfterDueDateError);

                await expect(
                    findTransaction(db, transactions.planned.id),
                ).resolves.toEqual(transactions.planned);
            });

            it('rejects moving the due date before a preserved accounting month', async () => {
                await service.update(user.id, transactions.planned.id, {
                    dueDate: '2026-12-15',
                    accountingMonth: '2026-11-01',
                });

                await expect(
                    service.update(user.id, transactions.planned.id, {
                        dueDate: '2026-10-20',
                    }),
                ).rejects.toThrow(TransactionAccountingMonthAfterDueDateError);
            });

            describe('account start date boundaries', () => {
                let recentAccount: Account;
                let recentAccountTransaction: Transaction;

                beforeEach(async () => {
                    recentAccount = await createAccount(
                        db,
                        user.id,
                        'Recent Account',
                        0,
                        '2026-12-10',
                    );

                    recentAccountTransaction = await createPlannedTransaction(
                        db,
                        user.id,
                        recentAccount.id,
                        expenseCategory.id,
                        'E',
                        100_00,
                        '2026-12-31',
                    );
                });

                it.for([
                    [
                        'due date before account start date',
                        { dueDate: '2026-12-09' },
                    ],
                    [
                        'accounting month before account start month',
                        { accountingMonth: '2026-11-01' },
                    ],
                ])('rejects updates with %s', async ([_, data]) => {
                    await expect(
                        service.update(
                            user.id,
                            recentAccountTransaction.id,
                            data as UpdateTransactionDto,
                        ),
                    ).rejects.toThrow(TransactionBeforeAccountStartError);

                    await expect(
                        findTransaction(db, recentAccountTransaction.id),
                    ).resolves.toEqual(recentAccountTransaction);
                });

                it.for([
                    [
                        'due date equal to account start date',
                        { dueDate: '2026-12-10' },
                    ],
                    [
                        'accounting month equal to account start month',
                        { accountingMonth: '2026-12-01' },
                    ],
                ])('accepts updates with %s', async ([_, data]) => {
                    await expect(
                        service.update(
                            user.id,
                            recentAccountTransaction.id,
                            data as UpdateTransactionDto,
                        ),
                    ).resolves.toMatchObject(data as UpdateTransactionDto);

                    await expect(
                        findTransaction(db, recentAccountTransaction.id),
                    ).resolves.toMatchObject(data as UpdateTransactionDto);
                });
            });

            describe('category', () => {
                it('rejects categories that does not exist', async () => {});

                it('rejects categories that belongs to another user', async () => {});

                it('rejects inactive categories', async () => {});

                it('rejects a category type that does not match the transaction type', async () => {});

                it('accepts keeping the current category even if it became inactive', async () => {
                    await db
                        .update(categoriesTable)
                        .set({ active: false })
                        .where(eq(categoriesTable.id, incomeCategory.id));

                    await expect(
                        service.update(user.id, transactions.planned.id, {
                            categoryId: incomeCategory.id,
                            description: 'Same category',
                        }),
                    ).resolves.toMatchObject({ categoryId: incomeCategory.id });
                });
            });
        });
    });

    describe.todo('realize', () => {});

    describe.todo('cancel', () => {});

    describe.todo('reverse', () => {});
});
