export class UserNotFoundError extends Error {
    readonly code = 'USER_NOT_FOUND';

    constructor(id: number) {
        super(`User with ID ${id} not found`);
        this.name = UserNotFoundError.name;
    }
}
