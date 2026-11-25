import { z } from 'zod';

import {
    amountSchema,
    dateSchema,
    descriptionSchema,
    entryTypeSchema,
    idParamSchema,
    idSchema,
    INT32_MAX,
    LIST_LIMIT_DEFAULT,
    LIST_LIMIT_MAX,
    monthStartSchema,
} from '../common/dto.ts';

import { TRANSACTION_STATUSES } from './transactions.schema.ts';

export const TRANSACTION_DATE_FIELDS = [
    'dueDate',
    'transactionDate',
    'accountingMonth',
] as const;
export type TransactionDateField = (typeof TRANSACTION_DATE_FIELDS)[number];

export const transactionStatusSchema = z.enum(TRANSACTION_STATUSES);
export type TransactionStatus = z.infer<typeof transactionStatusSchema>;

const baseTransactionSchema = z.strictObject({
    type: entryTypeSchema,
    description: descriptionSchema,
    accountingMonth: monthStartSchema.optional(), // default: month of the due date
    accountId: idSchema,
    categoryId: idSchema.optional(), // default: system category of the type
});

const plannedSchema = baseTransactionSchema.extend({
    status: z.literal('P'),
    amount: amountSchema,
    dueDate: dateSchema,
});

// The planned amount and due date of a realized transaction are derived from
// the realized ones (RN-014), so the client does not send them.
const realizedSchema = baseTransactionSchema.extend({
    status: z.literal('C'),
    paidAmount: amountSchema,
    transactionDate: dateSchema.optional(), // default: today
});

export const createTransactionSchema = z.discriminatedUnion('status', [
    plannedSchema,
    realizedSchema,
]);
export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;

// The type, the account and the status are not editable here: the status
// changes through realize, cancel and reverse. What a realized transaction
// accepts (description and category only) depends on its state, so the
// service enforces it.
export const updateTransactionSchema = z
    .strictObject({
        description: descriptionSchema,
        amount: amountSchema,
        dueDate: dateSchema,
        accountingMonth: monthStartSchema,
        categoryId: idSchema,
    })
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    });
export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>;

export const realizeTransactionSchema = z.strictObject({
    paidAmount: amountSchema,
    transactionDate: dateSchema.optional(), // default: today
});
export type RealizeTransactionDto = z.infer<typeof realizeTransactionSchema>;

export const reverseTransactionSchema = z.strictObject({
    reversalDate: dateSchema.optional(), // default: today
});
export type ReverseTransactionDto = z.infer<typeof reverseTransactionSchema>;

export const listTransactionsQuerySchema = z
    .object({
        type: entryTypeSchema.optional(),
        status: transactionStatusSchema.optional(),

        dateField: z.enum(TRANSACTION_DATE_FIELDS).default('dueDate'),
        from: dateSchema.optional(),
        to: dateSchema.optional(),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(LIST_LIMIT_MAX)
            .default(LIST_LIMIT_DEFAULT),
        offset: z.coerce.number().int().min(0).max(INT32_MAX).default(0),

        accountId: idParamSchema.optional(),
        categoryId: idParamSchema.optional(),
    })
    .refine(
        (query) =>
            query.from === undefined ||
            query.to === undefined ||
            query.from <= query.to,
        {
            path: ['to'],
            error: 'The end date cannot be before the start date',
        },
    );
export type ListTransactionQuery = z.infer<typeof listTransactionsQuerySchema>;
