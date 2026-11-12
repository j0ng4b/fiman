import { defineConfig } from 'oxlint';

export default defineConfig({
    plugins: ['typescript'],

    categories: {
        correctness: 'error',
    },

    options: {
        typeAware: true,
        typeCheck: true,
    },

    rules: {
        'typescript/no-explicit-any': 'off',
        'typescript/no-floating-promises': 'error',
        'typescript/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                fixStyle: 'separate-type-imports',
            },
        ],
    },

    env: {
        node: true,
    },
});
