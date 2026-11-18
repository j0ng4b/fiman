import type { ArgumentsHost, HttpException } from '@nestjs/common';
import {
    BadRequestException,
    Catch,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import {
    AccountInactiveError,
    AccountNotFoundError,
} from '../accounts/accounts.exceptions.ts';
import {
    CategoryInactiveError,
    CategoryNotFoundError,
} from '../categories/categories.exceptions.ts';

import {
    TransactionAccountingMonthAfterDueDateError,
    TransactionAlreadyReversedError,
    TransactionBeforeAccountStartError,
    TransactionCategoryTypeMismatchError,
    TransactionDateInFutureError,
    TransactionFieldsImmutableError,
    TransactionNotEditableError,
    TransactionNotFoundError,
    TransactionNotPlannedError,
    TransactionNotRealizedError,
    TransactionReversalBeforeRealizedError,
} from './transactions.exceptions.ts';

type TransactionsError =
    | TransactionNotFoundError
    | TransactionNotPlannedError
    | TransactionNotEditableError
    | TransactionNotRealizedError
    | TransactionFieldsImmutableError
    | TransactionAlreadyReversedError
    | TransactionDateInFutureError
    | TransactionReversalBeforeRealizedError
    | TransactionBeforeAccountStartError
    | TransactionAccountingMonthAfterDueDateError
    | TransactionCategoryTypeMismatchError
    | AccountNotFoundError
    | AccountInactiveError
    | CategoryNotFoundError
    | CategoryInactiveError;

function toHttpException(error: TransactionsError): HttpException {
    const options = { errorCode: error.code };

    switch (error.code) {
        case 'TRANSACTION_NOT_FOUND':
            return new NotFoundException(error.message, options);

        // A value in the body is inconsistent: the client fixes the request.
        case 'TRANSACTION_FIELDS_IMMUTABLE':
        case 'TRANSACTION_DATE_IN_FUTURE':
        case 'TRANSACTION_ACCOUNTING_MONTH_AFTER_DUE_DATE':
        case 'TRANSACTION_REVERSAL_BEFORE_REALIZED':
        case 'TRANSACTION_BEFORE_ACCOUNT_START':
        case 'TRANSACTION_CATEGORY_TYPE_MISMATCH':

        // The ids come from the body, not from the route.
        case 'ACCOUNT_NOT_FOUND':
        case 'CATEGORY_NOT_FOUND':
            return new BadRequestException(error.message, options);

        // The state of the resource prevents the operation.
        case 'TRANSACTION_NOT_PLANNED':
        case 'TRANSACTION_NOT_EDITABLE':
        case 'TRANSACTION_NOT_REALIZED':
        case 'TRANSACTION_ALREADY_REVERSED':
        case 'ACCOUNT_INACTIVE':
        case 'CATEGORY_INACTIVE':
            return new ConflictException(error.message, options);

        default:
            const unreachable: never = error;
            throw unreachable;
    }
}

@Catch(
    TransactionNotFoundError,
    TransactionNotPlannedError,
    TransactionNotEditableError,
    TransactionNotRealizedError,
    TransactionFieldsImmutableError,
    TransactionAlreadyReversedError,
    TransactionDateInFutureError,
    TransactionReversalBeforeRealizedError,
    TransactionBeforeAccountStartError,
    TransactionAccountingMonthAfterDueDateError,
    TransactionCategoryTypeMismatchError,
    AccountNotFoundError,
    AccountInactiveError,
    CategoryNotFoundError,
    CategoryInactiveError,
)
export class TransactionsExceptionFilter extends BaseExceptionFilter {
    override catch(exception: TransactionsError, host: ArgumentsHost): void {
        super.catch(toHttpException(exception), host);
    }
}
