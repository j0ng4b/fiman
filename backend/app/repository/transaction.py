from app.model.domain import Transaction
from app.repository import IRepository


class ITransactionRepository(IRepository[Transaction]):
    pass

