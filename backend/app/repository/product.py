from app.model.domain import Product
from app.repository import IRepository


class IProductRepository(IRepository[Product]):
    pass


