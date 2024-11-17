from app.model.domain import UserAccount
from app.repository import IRepository


class IUserAccountRepository(IRepository[UserAccount]):
    pass

