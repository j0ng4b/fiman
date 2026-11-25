import type { Pool } from 'pg';
import { inject } from 'vitest';

import type { Account } from '../../src/accounts/accounts.schema.ts';
import type { Category } from '../../src/categories/categories.schema.ts';
import type { EntryType } from '../../src/common/dto.ts';
import type { Database } from '../../src/database/database.types.ts';
import type {
    TransactionDateField,
    TransactionStatus,
} from '../../src/transactions/transactions.dto.ts';
import type { Transaction } from '../../src/transactions/transactions.schema.ts';
import type { User } from '../../src/users/users.schema.ts';
import { TransactionNotFoundError } from '../../src/transactions/transactions.exceptions.ts';
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

describe('TransactionService', () => {
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
    });

    describe('create', () => {});

    describe('update', () => {});

    describe('realize', () => {});

    describe('cancel', () => {});

    describe('reverse', () => {});
});
