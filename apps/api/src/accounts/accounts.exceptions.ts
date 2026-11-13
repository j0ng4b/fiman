export class AccountNotFoundError extends Error {
    readonly code = 'ACCOUNT_NOT_FOUND';

    constructor(readonly id: number) {
        super(`Account with ID ${id} not found`);
        this.name = AccountNotFoundError.name;
    }
}

export class AccountInUseError extends Error {
    readonly code = 'ACCOUNT_IN_USE';

    constructor(readonly id: number) {
        super(`Account with ID ${id} is in use`);
        this.name = AccountInUseError.name;
    }
}

export class AccountHasMovementsError extends Error {
    readonly code = 'ACCOUNT_HAS_MOVEMENTS';

    constructor(readonly id: number) {
        super(`Account with ID ${id} already has movements`);
        this.name = AccountHasMovementsError.name;
    }
}

export class InvalidAccountStartDateError extends Error {
    readonly code = 'INVALID_ACCOUNT_START_DATE';

    constructor(readonly startDate: string) {
        super(`Start date ${startDate} can't be in the future`);
        this.name = InvalidAccountStartDateError.name;
    }
}
