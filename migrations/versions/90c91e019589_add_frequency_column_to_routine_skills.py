"""Add frequency column to routine_skills

Revision ID: 90c91e019589
Revises: 
Create Date: 2025-01-20 17:46:11.575346

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '90c91e019589'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('routine_skills', schema=None) as batch_op:
        batch_op.add_column(sa.Column('frequency', sa.Integer(), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('routine_skills', schema=None) as batch_op:
        batch_op.drop_column('frequency')

    # ### end Alembic commands ###
