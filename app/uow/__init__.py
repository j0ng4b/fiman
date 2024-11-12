from abc import ABC, abstractmethod
from types import TracebackType
from typing import Optional, Self, Type


class IUnitOfWork(ABC):
    def __enter__(self: Self) -> Self:
        return self


    def __exit__(self,
                 exception_type: Optional[Type[BaseException]],
                 exception_value: Optional[BaseException],
                 exception_traceback: Optional[TracebackType]) -> None:
        if exception_type is None:
            self.save()
        else:
            self.rollback()

    @abstractmethod
    def save(self: Self) -> None:
        raise NotImplementedError


    @abstractmethod
    def rollback(self: Self) -> None:
        raise NotImplementedError

