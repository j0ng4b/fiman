from app.model.domain import Account
from app.repository import IRepository


class IAccountRepository(IRepository[Account]):
    pass

