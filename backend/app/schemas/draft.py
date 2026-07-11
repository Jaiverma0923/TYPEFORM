from datetime import datetime
from typing import Any, Optional

from pydantic import Field

from app.schemas.common import ORMModel


class DraftAnswer(ORMModel):
    question_id: int = Field(gt=0)
    value: Any


class DraftUpdate(ORMModel):
    form_version: Optional[int] = Field(default=None, ge=1)
    answers: Optional[list[DraftAnswer]] = None
    current_question_id: Optional[int] = Field(default=None, gt=0)
    visited_question_ids: Optional[list[int]] = None
    started_at: Optional[datetime] = None
    completed: Optional[bool] = None
