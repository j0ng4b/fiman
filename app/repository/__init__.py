from abc import ABC, abstractmethod
from typing import Generic, List, Optional, Self, TypeVar


T = TypeVar('T')


class IRepository(Generic[T], ABC):
    @abstractmethod
    def add(self: Self, record: T) -> T:
        raise NotImplementedError

    @abstractmethod
    def update(self: Self, record: T) -> None:
        raise NotImplementedError

    @abstractmethod
    def delete(self: Self, record: T) -> None:
        raise NotImplementedError

    @abstractmethod
    def get_all(self: Self) -> List[T]:
        raise NotImplementedError

    @abstractmethod
    def get_by_id(self: Self, id: int) -> Optional[T]:
        raise NotImplementedError

