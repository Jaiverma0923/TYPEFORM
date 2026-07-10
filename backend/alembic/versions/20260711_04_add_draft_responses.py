"""Add persisted public form drafts.

Revision ID: 20260711_04
Revises: 20260711_03
Create Date: 2026-07-11
"""

from alembic import op
import sqlalchemy as sa

revision = "20260711_04"
down_revision = "20260711_03"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "draft_responses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("answers_json", sa.JSON(), nullable=False),
        sa.Column("current_question_id", sa.Integer(), sa.ForeignKey("questions.id"), nullable=False),
        sa.Column("visited_question_ids", sa.JSON(), nullable=False),
        sa.Column("form_version", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_saved_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("form_id", name="uq_draft_response_form"),
    )
    op.create_index("ix_draft_responses_form_id", "draft_responses", ["form_id"])


def downgrade() -> None:
    op.drop_index("ix_draft_responses_form_id", table_name="draft_responses")
    op.drop_table("draft_responses")
