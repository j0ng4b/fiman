from app.model.domain import Category
from app.repository import IRepository


class ICategoryRepository(IRepository[Category]):
    pass

