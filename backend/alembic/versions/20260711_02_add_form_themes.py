"""Add persisted themes for forms.

Revision ID: 20260711_02
Revises: 20260710_01
Create Date: 2026-07-11
"""

from alembic import op
import sqlalchemy as sa

revision = "20260711_02"
down_revision = "20260710_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "form_themes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("primary_color", sa.String(length=7), nullable=False),
        sa.Column("secondary_color", sa.String(length=7), nullable=False),
        sa.Column("background_color", sa.String(length=7), nullable=False),
        sa.Column("surface_color", sa.String(length=7), nullable=False),
        sa.Column("text_color", sa.String(length=7), nullable=False),
        sa.Column("border_color", sa.String(length=7), nullable=False),
        sa.Column("font_family", sa.String(length=32), nullable=False),
        sa.Column("heading_weight", sa.Integer(), nullable=False),
        sa.Column("body_weight", sa.Integer(), nullable=False),
        sa.Column("background_type", sa.String(length=16), nullable=False),
        sa.Column("background_value", sa.String(length=2048), nullable=False),
        sa.Column("border_radius", sa.Integer(), nullable=False),
        sa.Column("input_radius", sa.Integer(), nullable=False),
        sa.Column("button_style", sa.String(length=16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("form_id"),
    )
    op.create_index("ix_form_themes_form_id", "form_themes", ["form_id"])
    op.execute("""
        INSERT INTO form_themes (
            form_id, name, primary_color, secondary_color, background_color,
            surface_color, text_color, border_color, font_family,
            heading_weight, body_weight, background_type, background_value,
            border_radius, input_radius, button_style, created_at, updated_at
        )
        SELECT id, 'Default', '#262626', '#f59e0b', '#ffffff',
            '#ffffff', '#1c1917', '#e7e5e4', 'Inter',
            700, 400, 'solid', '#ffffff', 8, 8, 'filled', created_at, updated_at
        FROM forms
    """)


def downgrade() -> None:
    op.drop_index("ix_form_themes_form_id", table_name="form_themes")
    op.drop_table("form_themes")
