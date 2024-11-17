from app.model.domain import Invitation
from app.repository import IRepository


class IInvitationRepository(IRepository[Invitation]):
    pass

