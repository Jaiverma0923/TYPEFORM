from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utc_now


class DraftResponse(Base):
    __tablename__ = "draft_responses"
    __table_args__ = (UniqueConstraint("form_id", name="uq_draft_response_form"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    answers_json: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    current_question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), nullable=False)
    visited_question_ids: Mapped[list[int]] = mapped_column(JSON, default=list, nullable=False)
    form_version: Mapped[int] = mapped_column(Integer, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    last_saved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="draft_response")
