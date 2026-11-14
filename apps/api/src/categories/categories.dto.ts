import { z } from 'zod';

import { entryTypeSchema } from '../common/dto.ts';

const categoryNameSchema = z.string().trim().min(1).max(100);

export const createCategorySchema = z.object({
    name: categoryNameSchema,
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
