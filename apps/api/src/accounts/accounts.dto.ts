import { z } from 'zod';

import { dateSchema, nameSchema } from '../common/dto.ts';

export const createAccountSchema = z.object({
    name: nameSchema,
    startDate: dateSchema.optional(),
    initialBalance: z.int32(),
});
export type CreateAccountDto = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    });
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;
