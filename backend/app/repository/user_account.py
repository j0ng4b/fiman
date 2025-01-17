from abc import abstractmethod
from typing import List, Self

from app.model.domain import UserAccount
from app.repository import IRepository


class IUserAccountRepository(IRepository[UserAccount]):
    @abstractmethod
    def get_accounts_by_user_id(self: Self, user_id: int) -> List[UserAccount]:
        raise NotImplementedError

