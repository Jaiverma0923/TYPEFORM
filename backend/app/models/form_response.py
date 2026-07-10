from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utc_now


class FormResponse(Base):
    __tablename__ = "form_responses"
    __table_args__ = (
        CheckConstraint("completion_time_seconds IS NULL OR completion_time_seconds >= 0", name="ck_response_completion_nonnegative"),
        CheckConstraint("form_version > 0", name="ck_response_form_version_positive"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    form_version: Mapped[int] = mapped_column(Integer, nullable=False)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    completion_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    form: Mapped["Form"] = relationship(back_populates="responses")
    answers: Mapped[list["Answer"]] = relationship(back_populates="response", cascade="all, delete-orphan")
