import { z } from 'zod';

const INT32_MAX = 2_147_483_647;

export const idSchema = z.coerce.number().int().positive().max(INT32_MAX);

export const amountSchema = z.int32().positive();

export const dateSchema = z.iso.date();

export const monthStartSchema = z.iso
    .date()
    .refine((data) => data.endsWith('-01'), {
        error: 'Must be the first day of a month',
    });

export const nameSchema = z.string().trim().min(1).max(100);

export const descriptionSchema = z.string().trim().min(1).max(255);

/** I = income, E = Expense. */
export const ENTRY_TYPES = ['I', 'E'] as const;
export const entryTypeSchema = z.enum(ENTRY_TYPES);
export type EntryType = z.infer<typeof entryTypeSchema>;

export const setActiveSchema = z.object({ active: z.boolean() });
export type SetActiveDto = z.infer<typeof setActiveSchema>;
