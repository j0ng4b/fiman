import type { Provider } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleQueryError, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import type { Database } from './database.types.ts';
import { DATABASE } from './database.constants.ts';
import { DatabaseConnectionError } from './database.exceptions.ts';

const logger = new Logger('Database');

export const DatabaseProvider = {
    provide: DATABASE,
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<Database> => {
        const db = drizzle(configService.getOrThrow<string>('DATABASE_URL'));

        try {
            logger.log('Testing database connection.');
            await db.execute(sql`select 1`);
        } catch (error) {
            if (!(error instanceof DrizzleQueryError)) {
                throw error;
            }

            logger.fatal('Fail to connect to database.');
            throw new DatabaseConnectionError('Fail to connect to database!');
        }

        logger.log('Successfully connected to database.');
        return db;
    },
} as Provider;
