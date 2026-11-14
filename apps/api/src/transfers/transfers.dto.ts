import { z } from 'zod';

import {
    amountSchema,
    dateSchema,
    descriptionSchema,
    idSchema,
} from '../common/dto.ts';

export const createTransferSchema = z
    .object({
        fromAccountId: idSchema,
        toAccountId: idSchema,
        amount: amountSchema,
        date: dateSchema,
        description: descriptionSchema.nullish(),
    })
    .refine((data) => data.fromAccountId !== data.toAccountId, {
        path: ['toAccountId'],
        error: 'Source and destination accounts must be different',
    });
export type CreateTransferDto = z.infer<typeof createTransferSchema>;

export const updateTransferSchema = z.strictObject({
    description: descriptionSchema.nullable(),
});
export type UpdateTransferDto = z.infer<typeof updateTransferSchema>;
