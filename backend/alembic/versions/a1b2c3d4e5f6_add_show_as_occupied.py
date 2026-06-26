"""add_show_as_occupied

Revision ID: a1b2c3d4e5f6
Revises: 9e562681d426
Create Date: 2026-06-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9e562681d426'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('blocked_slots', sa.Column('show_as_occupied', sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    op.drop_column('blocked_slots', 'show_as_occupied')
