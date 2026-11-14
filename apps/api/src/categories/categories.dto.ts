import { z } from 'zod';

import { entryTypeSchema, nameSchema } from '../common/dto.ts';

export const createCategorySchema = z.object({
    name: nameSchema,
    type: entryTypeSchema,
});
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.strictObject({
    name: nameSchema,
});
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
