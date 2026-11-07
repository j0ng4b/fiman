export class UserNotFoundError extends Error {
    constructor(id: number) {
        super(`User with ID ${id} not found`);
        this.name = UserNotFoundError.name;
    }
}
