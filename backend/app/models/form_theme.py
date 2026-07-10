from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utc_now


class FormTheme(Base):
    __tablename__ = "form_themes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_color: Mapped[str] = mapped_column(String(7), nullable=False)
    secondary_color: Mapped[str] = mapped_column(String(7), nullable=False)
    background_color: Mapped[str] = mapped_column(String(7), nullable=False)
    surface_color: Mapped[str] = mapped_column(String(7), nullable=False)
    text_color: Mapped[str] = mapped_column(String(7), nullable=False)
    border_color: Mapped[str] = mapped_column(String(7), nullable=False)
    font_family: Mapped[str] = mapped_column(String(32), nullable=False)
    heading_weight: Mapped[int] = mapped_column(Integer, nullable=False)
    body_weight: Mapped[int] = mapped_column(Integer, nullable=False)
    background_type: Mapped[str] = mapped_column(String(16), nullable=False)
    background_value: Mapped[str] = mapped_column(String(2048), nullable=False)
    border_radius: Mapped[int] = mapped_column(Integer, nullable=False)
    input_radius: Mapped[int] = mapped_column(Integer, nullable=False)
    button_style: Mapped[str] = mapped_column(String(16), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="theme")
