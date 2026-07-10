from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, utc_now


class LogicRule(Base):
    __tablename__ = "logic_rules"
    __table_args__ = (CheckConstraint("priority >= 0", name="ck_logic_rule_priority_nonnegative"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), nullable=False, index=True)
    source_question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_question_id: Mapped[int | None] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=True, index=True)
    operator: Mapped[str] = mapped_column(String(32), nullable=False)
    comparison_value: Mapped[object | None] = mapped_column(JSON, nullable=True)
    action: Mapped[str] = mapped_column(String(32), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    form: Mapped["Form"] = relationship(back_populates="logic_rules")
