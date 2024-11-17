from typing import List, Optional, Self

from app.model.domain import Account
from app.repository.account import IAccountRepository


class FakeAccountRepository(IAccountRepository):
    def __init__(self: Self) -> None:
        self.data: dict[int, Account] = {}
        self.counter: int = 1

    def add(self: Self, record: Account) -> Account:
        record.id = self.counter

        self.data[self.counter] = record
        self.counter += 1

        return record

    def update(self: Self, record: Account) -> None:
        if record.id in self.data:
            self.data[record.id] = record

    def delete(self: Self, record: Account) -> None:
        if record.id in self.data:
            del self.data[record.id]

    def get_all(self: Self) -> List[Account]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[Account]:
        return self.data.get(id)

