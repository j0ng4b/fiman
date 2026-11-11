import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: { tsconfigPaths: true },
    test: {
        root: './',
        include: ['src/**/*.spec.ts'],
        globalSetup: './test/setup.ts',
        fileParallelism: false,
    },
});
