import { z } from 'zod';

import {
    amountSchema,
    dateSchema,
    descriptionSchema,
    entryTypeSchema,
    idSchema,
} from '../common/dto.ts';

export const INSTALLMENT_COUNT_MAX = 360;

export const createInstallmentSchema = z
    .object({
        type: entryTypeSchema,
        description: descriptionSchema,
        totalAmount: amountSchema,
        installmentCount: z.int().min(1).max(INSTALLMENT_COUNT_MAX),
        firstInstallmentDate: dateSchema,
        accountId: idSchema,
        categoryId: idSchema,
    })
    .refine((i) => i.totalAmount >= i.installmentCount, {
        path: ['totalAmount'],
        error: 'Total must be at least 1 cent per installment',
    });
export type CreateInstallmentDto = z.infer<typeof createInstallmentSchema>;
