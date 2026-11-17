import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: { tsconfigPaths: true },
    test: {
        root: './',
        globals: true,

        projects: [
            {
                test: {
                    name: 'unit',
                    include: ['./tests/unit/**/*.spec.ts'],
                },
            },
            {
                test: {
                    name: 'integration',
                    include: ['./tests/integration/**/*.spec.ts'],
                    globalSetup: ['./tests/integration/setup.ts'],
                    fileParallelism: false,
                },
            },
        ],
    },
});
