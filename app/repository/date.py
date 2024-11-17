from app.model.domain import Date
from app.repository import IRepository


class IDateRepository(IRepository[Date]):
    pass

