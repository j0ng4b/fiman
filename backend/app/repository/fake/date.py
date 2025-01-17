from typing import List, Optional, Self

from app.model.domain import Date
from app.repository.date import IDateRepository


class FakeDateRepository(IDateRepository):
    def __init__(self: Self) -> None:
        self.data: dict[int, Date] = {}
        self.counter: int = 1

    def add(self: Self, record: Date) -> Date:
        record.id = self.counter

        self.data[self.counter] = record
        self.counter += 1

        return record

    def update(self: Self, record: Date) -> None:
        if record.id in self.data:
            self.data[record.id] = record

    def delete(self: Self, record: Date) -> None:
        if record.id in self.data:
            del self.data[record.id]

    def get_all(self: Self) -> List[Date]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[Date]:
        return self.data.get(id)

