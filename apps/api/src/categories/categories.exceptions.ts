export class CategoryNotFoundError extends Error {
    readonly code = 'CATEGORY_NOT_FOUND';

    constructor(readonly id: number) {
        super(`Category with ID ${id} not found`);
        this.name = CategoryNotFoundError.name;
    }
}

export class CategoryInUseError extends Error {
    readonly code = 'CATEGORY_IN_USE';

    constructor(readonly id: number) {
        super(
            `Category with ID ${id} is referenced by transactions or installments`,
        );
        this.name = CategoryInUseError.name;
    }
}

export class CategoryIsSystemError extends Error {
    readonly code = 'CATEGORY_IS_SYSTEM';

    constructor(
        readonly id: number,
        readonly action: 'rename' | 'disable' | 'delete',
    ) {
        super(`System category with ID ${id} cannot be ${action}d`);
        this.name = CategoryIsSystemError.name;
    }
}

export class CategoryAlreadyExistsError extends Error {
    readonly code = 'CATEGORY_ALREADY_EXISTS';

    constructor(
        readonly name: string,
        readonly type: 'I' | 'E',
    ) {
        super(`Category "${name}" of type ${type} already exists`);
        this.name = CategoryAlreadyExistsError.name;
    }
}
