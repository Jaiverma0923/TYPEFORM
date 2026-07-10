from datetime import datetime
from enum import StrEnum

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utc_now


class FormStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"


class Form(Base):
    __tablename__ = "forms"
    __table_args__ = (CheckConstraint("version > 0", name="ck_form_version_positive"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    creator_id: Mapped[int] = mapped_column(ForeignKey("creators.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    slug: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
    status: Mapped[FormStatus] = mapped_column(Enum(FormStatus, native_enum=False, create_constraint=True, values_callable=lambda enum: [item.value for item in enum]), default=FormStatus.DRAFT, nullable=False)
    thank_you_title: Mapped[str] = mapped_column(String(255), default="Thank you!", nullable=False)
    thank_you_message: Mapped[str] = mapped_column(Text, default="Your response has been recorded.", nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    creator: Mapped["Creator"] = relationship(back_populates="forms")
    questions: Mapped[list["Question"]] = relationship(back_populates="form", cascade="all, delete-orphan", order_by="Question.position")
    responses: Mapped[list["FormResponse"]] = relationship(back_populates="form", cascade="all, delete-orphan")
    theme: Mapped["FormTheme | None"] = relationship(back_populates="form", cascade="all, delete-orphan", uselist=False)
