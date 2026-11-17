import type { EntryType } from '../common/dto.ts';

export class TransactionNotFoundError extends Error {
    readonly code = 'TRANSACTION_NOT_FOUND';

    constructor(readonly id: number) {
        super(`Transaction with ID ${id} not found`);
        this.name = TransactionNotFoundError.name;
    }
}

export class TransactionNotPlannedError extends Error {
    readonly code = 'TRANSACTION_NOT_PLANNED';

    constructor(
        readonly id: number,
        readonly action: 'realize' | 'cancel',
    ) {
        super(`Cannot ${action} transaction with ID ${id}: it is not planned`);
        this.name = TransactionNotPlannedError.name;
    }
}

export class TransactionNotEditableError extends Error {
    readonly code = 'TRANSACTION_NOT_EDITABLE';

    constructor(readonly id: number) {
        super(`Transaction with ID ${id} is canceled and cannot be edited`);
        this.name = TransactionNotEditableError.name;
    }
}

export class TransactionFieldsImmutableError extends Error {
    readonly code = 'TRANSACTION_FIELDS_IMMUTABLE';

    constructor(
        readonly id: number,
        readonly fields: readonly string[],
    ) {
        super(
            `Transaction with ID ${id} is realized: ${fields.join(', ')} cannot be changed`,
        );
        this.name = TransactionFieldsImmutableError.name;
    }
}

export class TransactionNotRealizedError extends Error {
    readonly code = 'TRANSACTION_NOT_REALIZED';

    constructor(readonly id: number) {
        super(`Cannot reverse transaction with ID ${id}: it is not realized`);
        this.name = TransactionNotRealizedError.name;
    }
}

export class TransactionAlreadyReversedError extends Error {
    readonly code = 'TRANSACTION_ALREADY_REVERSED';

    constructor(readonly id: number) {
        super(`Transaction with ID ${id} was already reversed`);
        this.name = TransactionAlreadyReversedError.name;
    }
}

export class TransactionDateInFutureError extends Error {
    readonly code = 'TRANSACTION_DATE_IN_FUTURE';

    constructor(
        readonly field: 'transactionDate' | 'reversalDate',
        readonly date: string,
    ) {
        super(`The ${field} ${date} cannot be in the future`);
        this.name = TransactionDateInFutureError.name;
    }
}

export class TransactionReversalBeforeRealizedError extends Error {
    readonly code = 'TRANSACTION_REVERSAL_BEFORE_REALIZED';

    constructor(
        readonly id: number,
        readonly reversalDate: string,
        readonly transactionDate: string,
    ) {
        super(
            `Reversal date ${reversalDate} of transaction with ID ${id} is before its realized date ${transactionDate}`,
        );
        this.name = TransactionReversalBeforeRealizedError.name;
    }
}

export class TransactionBeforeAccountStartError extends Error {
    readonly code = 'TRANSACTION_BEFORE_ACCOUNT_START';

    constructor(
        readonly field: 'dueDate' | 'transactionDate' | 'accountingMonth',
        readonly value: string,
        readonly startDate: string,
    ) {
        super(
            `The ${field} ${value} is before the start date ${startDate} of the account`,
        );
        this.name = TransactionBeforeAccountStartError.name;
    }
}

export class TransactionAccountingMonthAfterDueDateError extends Error {
    readonly code = 'TRANSACTION_ACCOUNTING_MONTH_AFTER_DUE_DATE';

    constructor(
        readonly accountingMonth: string,
        readonly dueDate: string,
    ) {
        super(
            `Accounting month ${accountingMonth} cannot be after the month of the due date ${dueDate}`,
        );
        this.name = TransactionAccountingMonthAfterDueDateError.name;
    }
}

export class TransactionCategoryTypeMismatchError extends Error {
    readonly code = 'TRANSACTION_CATEGORY_TYPE_MISMATCH';

    constructor(
        readonly categoryId: number,
        readonly expectedType: EntryType,
    ) {
        super(
            `Category with ID ${categoryId} cannot be used: the transaction requires type ${expectedType}`,
        );
        this.name = TransactionCategoryTypeMismatchError.name;
    }
}
