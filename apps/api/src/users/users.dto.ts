import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().trim().min(1).max(100),
});
export type CreateUserDto = z.infer<typeof createUserSchema>;

export const updateUserSchema = createUserSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    });
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
