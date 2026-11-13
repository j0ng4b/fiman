import type { ArgumentsHost, HttpException } from '@nestjs/common';
import {
    BadRequestException,
    Catch,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import {
    AccountHasMovementsError,
    AccountInUseError,
    AccountNotFoundError,
    InvalidAccountStartDateError,
} from './accounts.exceptions.ts';

type AccountsError =
    | AccountNotFoundError
    | AccountInUseError
    | AccountHasMovementsError
    | InvalidAccountStartDateError;

function toHttpException(error: AccountsError): HttpException {
    const options = { errorCode: error.code };

    switch (error.code) {
        case 'ACCOUNT_NOT_FOUND':
            return new NotFoundException(error.message, options);

        case 'ACCOUNT_HAS_MOVEMENTS':
        case 'ACCOUNT_IN_USE':
            return new ConflictException(error.message, options);

        case 'INVALID_ACCOUNT_START_DATE':
            return new BadRequestException(error.message, options);

        default: {
            const unreachable: never = error;
            throw unreachable;
        }
    }
}

@Catch(
    AccountNotFoundError,
    AccountInUseError,
    AccountHasMovementsError,
    InvalidAccountStartDateError,
)
export class AccountsExeceptionFilter extends BaseExceptionFilter {
    catch(exception: AccountsError, host: ArgumentsHost): void {
        super.catch(toHttpException(exception), host);
    }
}
