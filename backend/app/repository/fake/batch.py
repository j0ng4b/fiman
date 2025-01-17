from typing import List, Optional, Self

from app.model.domain import Batch
from app.repository.batch import IBatchRepository


class FakeBatchRepository(IBatchRepository):
    def __init__(self: Self) -> None:
        self.data: dict[int, Batch] = {}
        self.counter: int = 1

    def add(self: Self, record: Batch) -> Batch:
        record.id = self.counter

        self.data[self.counter] = record
        self.counter += 1

        return record

    def update(self: Self, record: Batch) -> None:
        if record.id in self.data:
            self.data[record.id] = record

    def delete(self: Self, record: Batch) -> None:
        if record.id in self.data:
            del self.data[record.id]

    def get_all(self: Self) -> List[Batch]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[Batch]:
        return self.data.get(id)

