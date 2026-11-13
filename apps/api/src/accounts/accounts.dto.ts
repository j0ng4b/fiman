import { z } from 'zod';

export const accountIdSchema = z.coerce
    .number()
    .int()
    .positive()
    .max(2_147_483_647);

export const createAccountSchema = z.object({
    name: z.string().trim().min(1).max(100),
    startDate: z.iso.date(),
    initialBalance: z.int32(),
});
export type CreateAccountDto = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = createAccountSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    });
export type UpdateAccountDto = z.infer<typeof updateAccountSchema>;

export const setActiveSchema = z.object({ active: z.boolean() });
export type SetActiveDto = z.infer<typeof setActiveSchema>;
