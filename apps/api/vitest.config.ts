import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: { tsconfigPaths: true },
    test: {
        root: './',
        include: ['src/**/*.spec.ts'],
        globals: true,
        globalSetup: './test/setup.ts',
        fileParallelism: false,
    },
});
