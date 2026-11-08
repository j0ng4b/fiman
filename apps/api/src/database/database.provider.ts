import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleQueryError, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { DATABASE } from './database.constants.ts';
import { DatabaseConnectionError } from './database.exceptions.ts';

export type Database = ReturnType<typeof drizzle>;

export const DatabaseProvider = {
    provide: DATABASE,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<Database> => {
        const db = drizzle(configService.getOrThrow<string>('DATABASE_URL'));

        try {
            // Test database connection (ping)
            await db.execute(sql`select 1`);
        } catch (error) {
            if (!(error instanceof DrizzleQueryError)) {
                throw error;
            }

            // TODO: Log fail to connect to database
            throw new DatabaseConnectionError('Fail to connect to database!');
        }

        // TODO: Log database connected success fully
        return db;
    },
} as Provider;
