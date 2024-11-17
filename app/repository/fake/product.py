from typing import List, Optional, Self

from app.model.domain import Product
from app.repository.product import IProductRepository


class FakeProductRepository(IProductRepository):
    def __init__(self: Self) -> None:
        self.data: dict[int, Product] = {}
        self.counter: int = 1

    def add(self: Self, record: Product) -> Product:
        record.id = self.counter

        self.data[self.counter] = record
        self.counter += 1

        return record

    def update(self: Self, record: Product) -> None:
        if record.id in self.data:
            self.data[record.id] = record

    def delete(self: Self, record: Product) -> None:
        if record.id in self.data:
            del self.data[record.id]

    def get_all(self: Self) -> List[Product]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[Product]:
        return self.data.get(id)

