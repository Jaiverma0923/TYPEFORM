"""Add persisted form logic rules.

Revision ID: 20260711_03
Revises: 20260711_02
Create Date: 2026-07-11
"""

from alembic import op
import sqlalchemy as sa

revision = "20260711_03"
down_revision = "20260711_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "logic_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("destination_question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), nullable=True),
        sa.Column("operator", sa.String(length=32), nullable=False),
        sa.Column("comparison_value", sa.JSON(), nullable=True),
        sa.Column("action", sa.String(length=32), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("priority >= 0", name="ck_logic_rule_priority_nonnegative"),
    )
    op.create_index("ix_logic_rules_form_id", "logic_rules", ["form_id"])
    op.create_index("ix_logic_rules_source_question_id", "logic_rules", ["source_question_id"])
    op.create_index("ix_logic_rules_destination_question_id", "logic_rules", ["destination_question_id"])


def downgrade() -> None:
    op.drop_index("ix_logic_rules_destination_question_id", table_name="logic_rules")
    op.drop_index("ix_logic_rules_source_question_id", table_name="logic_rules")
    op.drop_index("ix_logic_rules_form_id", table_name="logic_rules")
    op.drop_table("logic_rules")
