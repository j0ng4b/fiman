import { z } from 'zod';

import { nameSchema } from '../common/dto.ts';

export const createUserSchema = z.object({
    name: nameSchema,
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    });
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
