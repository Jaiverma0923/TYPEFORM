from datetime import datetime
from typing import Any

from pydantic import Field, field_validator

from app.models.question import QuestionType
from app.schemas.common import ORMModel, Pagination

AnswerValue = str | int | float | bool | list[str] | None


class AnswerSubmission(ORMModel):
    question_id: int = Field(gt=0)
    value: AnswerValue

    @field_validator("value")
    @classmethod
    def validate_value(cls, value: AnswerValue) -> AnswerValue:
        if isinstance(value, list) and not all(isinstance(item, str) for item in value):
            raise ValueError("Answer arrays must contain strings")
        return value


class ResponseSubmission(ORMModel):
    answers: list[AnswerSubmission] = Field(min_length=1)
    completion_time_seconds: int | None = Field(default=None, ge=0)
    form_version: int | None = Field(default=None, ge=1)


class FormResponseSummary(ORMModel):
    id: int
    form_id: int
    form_version: int
    completion_time_seconds: int | None
    submitted_at: datetime


class IndividualAnswer(ORMModel):
    question_id: int
    question_title: str
    question_type: QuestionType
    value: Any


class IndividualFormResponse(ORMModel):
    id: int
    form_id: int
    form_version: int
    completion_time_seconds: int | None
    submitted_at: datetime
    answers: list[IndividualAnswer]


class FormResponseList(ORMModel):
    items: list[FormResponseSummary]
    pagination: Pagination
