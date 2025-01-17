from app.model.domain import Batch
from app.repository import IRepository


class IBatchRepository(IRepository[Batch]):
    pass

