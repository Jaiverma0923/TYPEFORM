from datetime import datetime

from pydantic import Field

from app.models.question import QuestionType
from app.schemas.common import ORMModel


class QuestionSettings(ORMModel):
    options: list[str] | None = None
    min: int | float | None = None
    max: int | float | None = None
    placeholder: str | None = None


class QuestionCreate(ORMModel):
    type: QuestionType
    title: str = Field(min_length=1, max_length=500)
    description: str | None = None
    required: bool = False
    settings: QuestionSettings = Field(default_factory=QuestionSettings)


class QuestionUpdate(ORMModel):
    type: QuestionType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    required: bool | None = None
    settings: QuestionSettings | None = None
    version: int | None = Field(default=None, ge=1)


class QuestionResponse(ORMModel):
    id: int
    form_id: int
    type: QuestionType
    title: str
    description: str | None
    required: bool
    position: int
    settings: QuestionSettings = Field(validation_alias="settings_json")
    version: int
    created_at: datetime
    updated_at: datetime


class QuestionReorder(ORMModel):
    question_ids: list[int]


class PublicQuestion(ORMModel):
    id: int
    type: QuestionType
    title: str
    description: str | None
    required: bool
    position: int
    settings: QuestionSettings = Field(validation_alias="settings_json")
