from typing import List, Optional, Self

from app.model.domain import Category
from app.repository.category import ICategoryRepository


class FakeCategoryRepository(ICategoryRepository):
    def __init__(self: Self) -> None:
        self.data: dict[int, Category] = {}
        self.counter: int = 1

    def add(self: Self, record: Category) -> Category:
        record.id = self.counter

        self.data[self.counter] = record
        self.counter += 1

        return record

    def update(self: Self, record: Category) -> None:
        if record.id in self.data:
            self.data[record.id] = record

    def delete(self: Self, record: Category) -> None:
        if record.id in self.data:
            del self.data[record.id]

    def get_all(self: Self) -> List[Category]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[Category]:
        return self.data.get(id)

