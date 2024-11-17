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

    @abstractmethod
    def close(self: Self) -> None:
        raise NotImplementedError

    @property
    @abstractmethod
    def user(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def account(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def user_account(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def invitation(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def category(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def product(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def date(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def batch(self):
        raise NotImplementedError

    @property
    @abstractmethod
    def transaction(self):
        raise NotImplementedError

