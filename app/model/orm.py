from sqlalchemy import TIMESTAMP, Boolean, Column, DateTime, Enum, ForeignKey, Integer, MetaData, Numeric, String, Table
from sqlalchemy.orm import registry
from sqlalchemy.sql import expression, func
import app.model.domain as models


metadata = MetaData()


user_table = Table(
    'user', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String(20), nullable=False),
    Column('email', String(120), unique=True, nullable=False),
    Column('password', String(120), nullable=False),
    Column('salt', String(120), nullable=False),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


account_table = Table(
    'account', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String(20), nullable=False),
    Column('is_deleted', Boolean, nullable=False, server_default=expression.false()),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


user_account_table = Table(
    'user_account', metadata,
    Column('user_id', ForeignKey('user.id'), primary_key=True),
    Column('role', Enum(models.UserAccountRole), nullable=False),
    Column('account_id', ForeignKey('account.id'), primary_key=True),
)


invitation_table = Table(
    'invitation', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('inviter_id', ForeignKey('user.id'), nullable=False),
    Column('invitee_id', ForeignKey('user.id'), nullable=False),
    Column('account_id', ForeignKey('account.id'), nullable=False),
    Column('status', Enum(models.InviteStatus), nullable=False, default=models.InviteStatus.PENDING),
    Column('is_deleted', Boolean, nullable=False, server_default=expression.false()),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


category_table = Table(
    'category', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String(20), nullable=False),
    Column('description', String(50)),
    Column('account_id', ForeignKey('account.id'), nullable=False),
    Column('is_deleted', Boolean, nullable=False, server_default=expression.false()),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


product_table = Table(
    'product', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String(20), nullable=False),
    Column('description', String(50)),
    Column('category_id', ForeignKey('category.id'), nullable=False),
    Column('account_id', ForeignKey('account.id'), nullable=False),
    Column('is_deleted', Boolean, nullable=False, server_default=expression.false()),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


date_table = Table(
    'date', metadata,
    Column('id', Integer, primary_key=True, autoincrement=False),
    Column('date', DateTime, nullable=False),
    Column('year', Integer, nullable=False),
    Column('month', Integer, nullable=False),
    Column('day', Integer, nullable=False),
)


batch_table = Table(
    'batch', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('name', String(20), nullable=False),
    Column('description', String(50)),
    Column('date_id', ForeignKey('date.id'), nullable=False),
    Column('account_id', ForeignKey('account.id'), nullable=False),
    Column('is_deleted', Boolean, nullable=False, server_default=expression.false()),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


transaction_table = Table(
    'transaction', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('product_id', ForeignKey('product.id'), nullable=False),
    Column('amount', Numeric(12, 4), nullable=False),
    Column('date_id', ForeignKey('date.id'), nullable=False),
    Column('batch_id', ForeignKey('batch.id')),
    Column('account_id', ForeignKey('account.id')),
    Column('status', Enum(models.TransactionStatus), nullable=False, default=models.TransactionStatus.PENDING),
    Column('is_deleted', Boolean, nullable=False, server_default=expression.false()),
    Column('created_at', TIMESTAMP, nullable=False, server_default=func.current_timestamp()),
)


def map_domain_to_tables() -> None:
    mapper_registry = registry()

    mapper_registry.map_imperatively(models.User, user_table)
    mapper_registry.map_imperatively(models.Account, account_table)
    mapper_registry.map_imperatively(models.UserAccount, user_account_table)
    mapper_registry.map_imperatively(models.Invitation, invitation_table)
    mapper_registry.map_imperatively(models.Category, category_table)
    mapper_registry.map_imperatively(models.Product, product_table)
    mapper_registry.map_imperatively(models.Date, date_table)
    mapper_registry.map_imperatively(models.Batch, batch_table)
    mapper_registry.map_imperatively(models.Transaction, transaction_table)

