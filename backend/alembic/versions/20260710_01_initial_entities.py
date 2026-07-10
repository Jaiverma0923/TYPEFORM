"""Create initial Typeform entity tables.

Revision ID: 20260710_01
Revises:
Create Date: 2026-07-10
"""

from alembic import op
import sqlalchemy as sa

revision = "20260710_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "creators",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_creators_email", "creators", ["email"])
    op.create_table(
        "forms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("creator_id", sa.Integer(), sa.ForeignKey("creators.id"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("slug", sa.String(length=255), nullable=True),
        sa.Column("status", sa.Enum("draft", "published", name="formstatus", native_enum=False, create_constraint=True), nullable=False),
        sa.Column("thank_you_title", sa.String(length=255), nullable=False),
        sa.Column("thank_you_message", sa.Text(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("version > 0", name="ck_form_version_positive"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_forms_creator_id", "forms", ["creator_id"])
    op.create_index("ix_forms_slug", "forms", ["slug"])
    op.create_table(
        "questions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", sa.Enum("short_text", "long_text", "multiple_choice", "dropdown", "email", "number", "yes_no", "rating", name="questiontype", native_enum=False, create_constraint=True), nullable=False),
        sa.Column("title", sa.String(length=500), nullable=False), sa.Column("description", sa.Text(), nullable=True),
        sa.Column("required", sa.Boolean(), nullable=False), sa.Column("position", sa.Integer(), nullable=False),
        sa.Column("settings_json", sa.JSON(), nullable=False), sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("position >= 0", name="ck_question_position_nonnegative"), sa.CheckConstraint("version > 0", name="ck_question_version_positive"),
        sa.UniqueConstraint("form_id", "position", name="uq_question_form_position"),
    )
    op.create_index("ix_questions_form_id", "questions", ["form_id"])
    op.create_table(
        "form_responses",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("form_version", sa.Integer(), nullable=False), sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=False), sa.Column("completion_time_seconds", sa.Integer(), nullable=True),
        sa.CheckConstraint("completion_time_seconds IS NULL OR completion_time_seconds >= 0", name="ck_response_completion_nonnegative"), sa.CheckConstraint("form_version > 0", name="ck_response_form_version_positive"),
    )
    op.create_index("ix_form_responses_form_id", "form_responses", ["form_id"])
    op.create_table(
        "answers",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("response_id", sa.Integer(), sa.ForeignKey("form_responses.id", ondelete="CASCADE"), nullable=False),
        sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id"), nullable=False), sa.Column("value_json", sa.JSON(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("response_id", "question_id", name="uq_answer_response_question"),
    )
    op.create_index("ix_answers_response_id", "answers", ["response_id"])
    op.create_index("ix_answers_question_id", "answers", ["question_id"])


def downgrade() -> None:
    op.drop_table("answers")
    op.drop_table("form_responses")
    op.drop_table("questions")
    op.drop_table("forms")
    op.drop_table("creators")
