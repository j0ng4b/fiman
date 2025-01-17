from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class UserAccountRole(Enum):
    OWNER = 'Owner'
    ADMIN = 'Admin'
    MEMBER = 'Member'


class InviteStatus(Enum):
    PENDING = 'Pending'
    ACCEPTED = 'Accepted'
    DECLINED = 'Declined'


class TransactionStatus(Enum):
    PENDING = 'Pending'
    PAID = 'Paid'
    CANCELLED = 'Cancelled'


@dataclass
class User:
    id: int = field(init=False)
    name: str
    email: str
    password: str
    salt: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Account:
    id: int = field(init=False)
    name: str
    is_deleted: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class UserAccount:
    user_id: int
    role: UserAccountRole
    account_id: int


@dataclass
class Invitation:
    id: int = field(init=False)
    inviter_id: int
    invitee_id: int
    account_id: int
    status: InviteStatus = InviteStatus.PENDING
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Category:
    id: int = field(init=False)
    name: str
    account_id: int
    description: Optional[str] = None
    is_deleted: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Product:
    id: int = field(init=False)
    name: str
    category_id: int
    account_id: int
    description: Optional[str] = None
    is_deleted: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Date:
    id: int = field(init=False)
    date: datetime
    year: int = field(init=False)
    month: int = field(init=False)
    day: int = field(init=False)
    account_id: int

    def __post_init__(self) -> None:
        self.id = int(self.date.strftime('%Y%m%d'))
        self.year = self.date.year
        self.month = self.date.month
        self.day = self.date.day


@dataclass
class Batch:
    id: int = field(init=False)
    name: str
    date_id: int
    account_id: int
    description: Optional[str] = None
    is_deleted: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Transaction:
    id: int = field(init=False)
    amount: float
    product_id: int
    date_id: int
    batch_id: Optional[int]
    account_id: Optional[int]
    status: TransactionStatus = TransactionStatus.PENDING
    is_deleted: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

