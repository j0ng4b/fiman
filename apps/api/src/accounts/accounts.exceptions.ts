export class AccountNotFoundError extends Error {
    constructor(id: number) {
        super(`Account with ID ${id} not found`);
        this.name = AccountNotFoundError.name;
    }
}

export class AccountInUseError extends Error {
    constructor(id: number) {
        super(`Account with ID ${id} is in use`);
        this.name = AccountInUseError.name;
    }
}

export class AccountHasMovementsError extends Error {
    constructor(id: number) {
        super(`Account with ID ${id} already has movements`);
        this.name = AccountInUseError.name;
    }
}
