from abc import ABC, abstractmethod
from types import TracebackType
from typing import Optional, Self, Type

from app.repository.account import IAccountRepository
from app.repository.batch import IBatchRepository
from app.repository.category import ICategoryRepository
from app.repository.date import IDateRepository
from app.repository.invitation import IInvitationRepository
from app.repository.product import IProductRepository
from app.repository.transaction import ITransactionRepository
from app.repository.user import IUserRepository
from app.repository.user_account import IUserAccountRepository


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
    def user(self: Self) -> IUserRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def account(self: Self) -> IAccountRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def user_account(self: Self) -> IUserAccountRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def invitation(self: Self) -> IInvitationRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def category(self: Self) -> ICategoryRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def product(self: Self) -> IProductRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def date(self: Self) -> IDateRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def batch(self: Self) -> IBatchRepository:
        raise NotImplementedError

    @property
    @abstractmethod
    def transaction(self: Self) -> ITransactionRepository:
        raise NotImplementedError

