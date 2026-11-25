import { randomUUID } from 'node:crypto';

import type { Account } from '../../../src/accounts/accounts.schema.ts';
import type { Category } from '../../../src/categories/categories.schema.ts';
import type { IsoDate } from '../../../src/common/dates.ts';
import type { EntryType } from '../../../src/common/dto.ts';
import type { Database } from '../../../src/database/database.types.ts';
import type { Transaction } from '../../../src/transactions/transactions.schema.ts';
import type { Transfer } from '../../../src/transfers/transfers.schema.ts';
import type { User } from '../../../src/users/users.schema.ts';
import { accountsTable } from '../../../src/accounts/accounts.schema.ts';
import { categoriesTable } from '../../../src/categories/categories.schema.ts';
import { firstOfMonth, today, tomorrow } from '../../../src/common/dates.ts';
import { transactionsTable } from '../../../src/transactions/transactions.schema.ts';
import { transfersTable } from '../../../src/transfers/transfers.schema.ts';
import { usersTable } from '../../../src/users/users.schema.ts';

function first<T>(rows: T[]): T {
    if (rows.length == 0) {
        throw new Error('Insert did not return a row');
    }
    return rows[0];
}

function uniqueName(prefix: string): string {
    return `${prefix}-${randomUUID()}`;
}

export async function createUser(
    db: Database,
    name: string = 'TestUser',
): Promise<User> {
    return first(await db.insert(usersTable).values({ name }).returning());
}

export async function createCategory(
    db: Database,
    userId: number,
    type: EntryType,
    name: string = uniqueName('TestCategory'),
    isSystem: boolean = false,
): Promise<Category> {
    return first(
        await db
            .insert(categoriesTable)
            .values({ userId, type, name, isSystem })
            .returning(),
    );
}

export async function createAccount(
    db: Database,
    userId: number,
    name: string = uniqueName('TestAccount'),
    initialBalance: number = 100,
    startDate: IsoDate = '2020-01-01',
): Promise<Account> {
    return first(
        await db
            .insert(accountsTable)
            .values({ userId, name, initialBalance, startDate })
            .returning(),
    );
}

export async function createPlannedTransaction(
    db: Database,
    userId: number,
    accountId: number,
    categoryId: number,
    type: EntryType,
    amount: number = 10000,
    dueDate: IsoDate = tomorrow(),
    description: string = 'TestPlannedTransaction',
): Promise<Transaction> {
    return first(
        await db
            .insert(transactionsTable)
            .values({
                type,
                status: 'P',
                userId,
                accountId,
                categoryId,
                description,
                dueDate,
                amount,
                accountingMonth: firstOfMonth(dueDate),
            })
            .returning(),
    );
}

export async function createCanceledTransaction(
    db: Database,
    userId: number,
    accountId: number,
    categoryId: number,
    type: EntryType,
): Promise<Transaction> {
    return first(
        await db
            .insert(transactionsTable)
            .values({
                type,
                status: 'X',
                userId,
                accountId,
                categoryId,
                description: 'TestCanceledTransaction',
                dueDate: tomorrow(),
                amount: 1000_00,
                accountingMonth: firstOfMonth(tomorrow()),
            })
            .returning(),
    );
}

export async function createRealizedTransaction(
    db: Database,
    userId: number,
    accountId: number,
    categoryId: number,
    type: EntryType,
    amount: number = 10000,
    paidAmount: number = amount,
    transactionDate: IsoDate = today(),
    dueDate: IsoDate = transactionDate,
    description: string = 'TestRealizedTransaction',
): Promise<Transaction> {
    return first(
        await db
            .insert(transactionsTable)
            .values({
                type,
                status: 'C',
                userId,
                accountId,
                categoryId,
                description,
                paidAmount,
                transactionDate,
                dueDate,
                amount,
                accountingMonth: firstOfMonth(dueDate),
            })
            .returning(),
    );
}

export async function createTransfer(
    db: Database,
    userId: number,
    fromAccountId: number,
    toAccountId: number,
    amount: number = 10000,
    date: IsoDate = today(),
    description: string = 'TestTransfer',
): Promise<Transfer> {
    return first(
        await db
            .insert(transfersTable)
            .values({
                userId,
                fromAccountId,
                toAccountId,
                amount,
                date,
                description,
            })
            .returning(),
    );
}
