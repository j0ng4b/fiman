import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

export const PgErrorCode = {
    ForeignKeyViolation: '23503',
    UniqueViolation: '23505',
    CheckViolation: '23514',
} as const;

function getDatabaseError(error: unknown): DatabaseError | undefined {
    if (!(error instanceof DrizzleQueryError)) {
        return undefined;
    }

    if (!(error.cause instanceof DatabaseError)) {
        return undefined;
    }

    return error.cause;
}

export function isForeignKeyViolation(error: unknown): boolean {
    return getDatabaseError(error)?.code == PgErrorCode.ForeignKeyViolation;
}

export function isUniqueViolation(error: unknown): boolean {
    return getDatabaseError(error)?.code == PgErrorCode.UniqueViolation;
}

export function isCheckViolation(error: unknown): boolean {
    return getDatabaseError(error)?.code == PgErrorCode.CheckViolation;
}
