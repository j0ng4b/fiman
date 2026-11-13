import { z } from 'zod';

const INT32_MAX = 2_147_483_647;

export const idSchema = z.coerce.number().int().positive().max(INT32_MAX);
