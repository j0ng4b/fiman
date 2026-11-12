export class AccountNotFoundError extends Error {
    constructor(readonly id: number) {
        super(`Account with ID ${id} not found`);
        this.name = AccountNotFoundError.name;
    }
}

export class AccountInUseError extends Error {
    constructor(readonly id: number) {
        super(`Account with ID ${id} is in use`);
        this.name = AccountInUseError.name;
    }
}

export class AccountHasMovementsError extends Error {
    constructor(readonly id: number) {
        super(`Account with ID ${id} already has movements`);
        this.name = AccountHasMovementsError.name;
    }
}

export class InvalidAccountStartDateError extends Error {
    constructor(readonly startDate: string) {
        super(`Start date ${startDate} can't be in the future`);
        this.name = InvalidAccountStartDateError.name;
    }
}
