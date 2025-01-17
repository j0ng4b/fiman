from typing import Self

from app.repository.account import IAccountRepository
from app.repository.batch import IBatchRepository
from app.repository.category import ICategoryRepository
from app.repository.date import IDateRepository
from app.repository.invitation import IInvitationRepository
from app.repository.product import IProductRepository
from app.repository.transaction import ITransactionRepository
from app.repository.user import IUserRepository
from app.repository.user_account import IUserAccountRepository

from app.repository.fake.account import FakeAccountRepository
from app.repository.fake.batch import FakeBatchRepository
from app.repository.fake.category import FakeCategoryRepository
from app.repository.fake.date import FakeDateRepository
from app.repository.fake.invitation import FakeInvitationRepository
from app.repository.fake.product import FakeProductRepository
from app.repository.fake.transaction import FakeTransactionRepository
from app.repository.fake.user import FakeUserRepository
from app.repository.fake.user_account import FakeUserAccountRepository

from app.uow import IUnitOfWork


class FakeUnitOfWork(IUnitOfWork):
    def __init__(self: Self) -> None:
        self._user_repository = None
        self._account_repository = None
        self._user_account_repository = None
        self._invitation_repository = None
        self._category_repository = None
        self._product_repository = None
        self._date_repository = None
        self._batch_repository = None
        self._transaction_repository = None

        self._saved = False

    def save(self: Self) -> None:
        self._saved = True

    def rollback(self: Self) -> None:
        self._saved = True

    def close(self: Self) -> None:
        raise NotImplementedError

    @property
    def user(self: Self) -> IUserRepository:
        if self._user_repository is None:
            self._user_repository = FakeUserRepository()
        return self._user_repository

    @property
    def account(self: Self) -> IAccountRepository:
        if self._account_repository is None:
            self._account_repository = FakeAccountRepository()
        return self._account_repository

    @property
    def user_account(self: Self) -> IUserAccountRepository:
        if self._user_account_repository is None:
            self._user_account_repository = FakeUserAccountRepository()
        return self._user_account_repository

    @property
    def invitation(self: Self) -> IInvitationRepository:
        if self._invitation_repository is None:
            self._invitation_repository = FakeInvitationRepository()
        return self._invitation_repository

    @property
    def category(self: Self) -> ICategoryRepository:
        if self._category_repository is None:
            self._category_repository = FakeCategoryRepository()
        return self._category_repository

    @property
    def product(self: Self) -> IProductRepository:
        if self._product_repository is None:
            self._product_repository = FakeProductRepository()
        return self._product_repository

    @property
    def date(self: Self) -> IDateRepository:
        if self._date_repository is None:
            self._date_repository = FakeDateRepository()
        return self._date_repository

    @property
    def batch(self: Self) -> IBatchRepository:
        if self._batch_repository is None:
            self._batch_repository = FakeBatchRepository()
        return self._batch_repository

    @property
    def transaction(self: Self) -> ITransactionRepository:
        if self._transaction_repository is None:
            self._transaction_repository = FakeTransactionRepository()
        return self._transaction_repository

