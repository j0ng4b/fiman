import type { ArgumentsHost, HttpException } from '@nestjs/common';
import { Catch, NotFoundException, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import {
    CategoryAlreadyExistsError,
    CategoryInactiveError,
    CategoryInUseError,
    CategoryIsSystemError,
    CategoryNotFoundError,
} from './categories.exceptions.ts';

type CategoriesError =
    | CategoryNotFoundError
    | CategoryIsSystemError
    | CategoryAlreadyExistsError
    | CategoryInUseError
    | CategoryInactiveError;

function toHttpException(error: CategoriesError): HttpException {
    const options = { errorCode: error.code };

    switch (error.code) {
        case 'CATEGORY_NOT_FOUND':
            return new NotFoundException(error.message, options);

        case 'CATEGORY_IS_SYSTEM':
        case 'CATEGORY_ALREADY_EXISTS':
        case 'CATEGORY_IN_USE':
        case 'CATEGORY_INACTIVE':
            return new ConflictException(error.message, options);

        default: {
            const unreachable: never = error;
            throw unreachable;
        }
    }
}

@Catch(
    CategoryNotFoundError,
    CategoryIsSystemError,
    CategoryAlreadyExistsError,
    CategoryInUseError,
)
export class CategoriesExceptionFilter extends BaseExceptionFilter {
    catch(exception: CategoriesError, host: ArgumentsHost): void {
        super.catch(toHttpException(exception), host);
    }
}
