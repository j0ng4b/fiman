import { NewCategory } from './categories.schema.ts';

export const SYSTEM_CATEGORIES = [
    { name: 'Outros', type: 'I' },
    { name: 'Outros', type: 'E' },
] as const satisfies readonly Pick<NewCategory, 'name' | 'type'>[];
