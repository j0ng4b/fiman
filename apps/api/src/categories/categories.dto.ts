import { z } from 'zod';

import { entryTypeSchema, nameSchema } from '../common/dto.ts';

export const createCategorySchema = z.object({
    name: nameSchema,
    type: entryTypeSchema,
});
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema
    .strict()
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
        error: 'At least one field should be provided!',
    });
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
