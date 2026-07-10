from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.common import ORMModel


class DraftAnswer(ORMModel):
    question_id: int = Field(gt=0)
    value: Any


class DraftUpdate(ORMModel):
    form_version: int = Field(default=None, ge=1)
    answers: list[DraftAnswer] = None
    current_question_id: int = Field(default=None, gt=0)
    visited_question_ids: list[int] = None
    started_at: datetime = None
    completed: bool = None
