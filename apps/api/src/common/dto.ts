import { z } from 'zod';

const INT32_MAX = 2_147_483_647;

export const idSchema = z.coerce.number().int().positive().max(INT32_MAX);

/** I = income, E = Expense. */
export const ENTRY_TYPES = ['I', 'E'] as const;
export const entryTypeSchema = z.enum(ENTRY_TYPES);
export type EntryType = z.infer<typeof entryTypeSchema>;

export const setActiveSchema = z.object({ active: z.boolean() });
export type SetActiveDto = z.infer<typeof setActiveSchema>;
