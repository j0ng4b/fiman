from abc import abstractmethod
from typing import Optional

from app.model.domain import User
from app.repository import IRepository


class IUserRepository(IRepository[User]):
    @abstractmethod
    def get_by_email(self, email: str) -> Optional[User]:
        raise NotImplementedError

