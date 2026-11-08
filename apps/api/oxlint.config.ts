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
    },

    env: {
        node: true,
    },
});
