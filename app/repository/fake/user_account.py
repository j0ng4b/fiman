from typing import List, Optional, Self

from app.model.domain import UserAccount
from app.repository.user_account import IUserAccountRepository


class FakeUserAccountRepository(IUserAccountRepository):
    def __init__(self: Self) -> None:
        self.data: dict[tuple[int, int], UserAccount] = {}

    def add(self: Self, record: UserAccount) -> UserAccount:
        key = (record.user_id, record.account_id)

        if key not in self.data:
            self.data[key] = record

        return record

    def update(self: Self, record: UserAccount) -> None:
        key = (record.user_id, record.account_id)
        if key in self.data:
            self.data[key] = record

    def delete(self: Self, record: UserAccount) -> None:
        key = (record.user_id, record.account_id)
        if key in self.data:
            del self.data[key]

    def get_all(self: Self) -> List[UserAccount]:
        return list(self.data.values())

    def get_by_id(self: Self, id: int) -> Optional[UserAccount]:
        return None

    def get_accounts_by_user_id(self: Self, user_id: int) -> List[UserAccount]:
        user_accounts = []

        for user_account in self.data.values():
            if user_account.user_id == user_id:
                user_accounts.append(user_account)

        return user_accounts

