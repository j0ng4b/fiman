import {
    ArgumentsHost,
    Catch,
    HttpException,
    NotFoundException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

import { UserNotFoundError } from './users.exceptions.ts';

type UsersError = UserNotFoundError;

function toHttpException(error: UsersError): HttpException {
    const options = { errorCode: error.code };

    switch (error.code) {
        case 'USER_NOT_FOUND':
            return new NotFoundException(error.message, options);

        default: {
            const unreachable: never = error.code;
            throw new Error(
                `Unhandled users error code: ${String(unreachable)}`,
            );
        }
    }
}

@Catch(UserNotFoundError)
export class UserExceptionFilter extends BaseExceptionFilter {
    catch(exception: UsersError, host: ArgumentsHost): void {
        super.catch(toHttpException(exception), host);
    }
}
