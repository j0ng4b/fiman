import { defineConfig } from 'oxfmt';

export default defineConfig({
    printWidth: 80,
    singleQuote: true,

    sortImports: {
        internalPattern: ['@/'],
        newlinesBetween: true,

        customGroups: [
            {
                groupName: 'type-tests',
                modifiers: ['type'],
                elementNamePattern: ['**/tests/**', '**/*.spec.ts'],
            },

            {
                groupName: 'value-tests',
                modifiers: ['value'],
                elementNamePattern: ['**/tests/**', '**/*.spec.ts'],
            },
        ],

        groups: [
            'type-builtin',
            { newlinesBetween: false },
            'value-builtin',
            'type-external',
            { newlinesBetween: false },
            'value-external',
            'type-internal',
            { newlinesBetween: false },
            'value-internal',
            'type-parent',
            { newlinesBetween: false },
            'value-parent',
            'type-sibling',
            { newlinesBetween: false },
            'value-sibling',
            'type-index',
            { newlinesBetween: false },
            'value-index',
            'type-tests',
            { newlinesBetween: false },
            'value-tests',
            'unknown',
        ],
    },

    jsdoc: {
        descriptionWithDot: true,
        separateTagGroups: true,
        separateReturnsFromParam: true,
    },
});
