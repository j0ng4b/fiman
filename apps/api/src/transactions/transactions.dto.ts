import { z } from 'zod';

import {
    amountSchema,
    dateSchema,
    descriptionSchema,
    entryTypeSchema,
    idSchema,
    monthStartSchema,
} from '../common/dto.ts';

import { TRANSACTION_STATUSES } from './transactions.schema.ts';

export const transactionStatusSchema = z.enum(TRANSACTION_STATUSES);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

const baseTransactionSchema = z.strictObject({
    type: entryTypeSchema,
    description: descriptionSchema,
    amount: amountSchema,
    dueDate: dateSchema,
    accountingMonth: monthStartSchema.optional(),
    accountId: idSchema,
    categoryId: idSchema,
});

const plannedSchema = baseTransactionSchema.extend({
    status: z.literal('P'),
});

const realizedSchema = baseTransactionSchema.extend({
    status: z.literal('C'),
    paidAmount: amountSchema,
    transactionDate: dateSchema,
});

export const createTransactionSchema = z
    .discriminatedUnion('status', [plannedSchema, realizedSchema])
    .refine(
        (data) =>
            data.accountingMonth === undefined ||
            data.accountingMonth <= data.dueDate,
        {
            path: ['accountingMonth'],
            error: 'Competence month cannot be after the due date',
        },
    );
export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

// Only planned transactions are editable. The type is immutable (the
// category must match it) and the status changes through its own operations.
export const updateTransactionSchema = z
    .strictObject({
        description: descriptionSchema,
        amount: amountSchema,
        dueDate: dateSchema,
        accountingMonth: monthStartSchema,
        accountId: idSchema,
        categoryId: idSchema,
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    })
    .refine(
        (data) =>
            data.accountingMonth === undefined ||
            data.dueDate === undefined ||
            data.accountingMonth <= data.dueDate,
        {
            path: ['accountingMonth'],
            error: 'Competence month cannot be after the due date',
        },
    );
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export const realizeTransactionSchema = z.strictObject({
    paidAmount: amountSchema,
    transactionDate: dateSchema,
});
export type RealizeTransactionDto = z.infer<typeof realizeTransactionSchema>;

export const reverseTransactionSchema = z.strictObject({
    reversalDate: dateSchema,
});
export type ReverseTransactionDto = z.infer<typeof reverseTransactionSchema>;
