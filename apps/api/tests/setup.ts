import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
    export interface ProvidedContext {
        databaseUrl: string;
    }
}

export default async function setup(project: TestProject) {
    const container = await new PostgreSqlContainer(
        'postgres:17-alpine',
    ).start();

    const url = container.getConnectionUri();
    const pool = new Pool({ connectionString: url });

    // Migrate test database.
    try {
        await migrate(drizzle({ client: pool }), {
            migrationsFolder: './migrations/',
        });
    } catch (error) {
        await pool.end();
        await container.stop();

        throw error;
    }

    await pool.end();

    // Provide test database url to tests.
    project.provide('databaseUrl', url);

    return async function teardown() {
        await container.stop();
    };
}
