from typing import List, Optional, Self

from app.model.domain import User
from app.repository.user import IUserRepository


class FakeUserRepository(IUserRepository):
    def __init__(self: Self) -> None:
        self.data: dict[int, User] = {}
        self.counter: int = 1

    def add(self: Self, record: User) -> User:
        record.id = self.counter

        self.data[self.counter] = record
        self.counter += 1

        return record

    def update(self: Self, record: User) -> None:
        if record.id in self.data:
            self.data[record.id] = record

    def delete(self: Self, record: User) -> None:
        if record.id in self.data:
            del self.data[record.id]

    def get_all(self: Self) -> List[User]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[User]:
        return self.data.get(id)

    def get_by_email(self, email: str) -> Optional[User]:
        for user in self.data.values():
            if user.email == email:
                return user

        return None

