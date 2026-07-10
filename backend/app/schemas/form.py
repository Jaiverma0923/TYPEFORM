from datetime import datetime

from pydantic import Field

from app.models.form import FormStatus
from app.schemas.common import ORMModel


class CreatorResponse(ORMModel):
    id: int
    name: str
    email: str
    created_at: datetime


# Contract-facing name for the Creator entity schema.
Creator = CreatorResponse


class FormCreate(ORMModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    thank_you_title: str = "Thank you!"
    thank_you_message: str = "Your response has been recorded."


class FormUpdate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    thank_you_title: str | None = None
    thank_you_message: str | None = None


class FormSummary(ORMModel):
    id: int
    title: str
    description: str | None
    slug: str | None
    status: FormStatus
    version: int
    question_count: int = 0
    response_count: int = 0
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None


class FormDuplicate(ORMModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)


class FormDetail(FormSummary):
    thank_you_title: str
    thank_you_message: str
    questions: list["QuestionResponse"] = Field(default_factory=list)


class PublicForm(ORMModel):
    id: int
    title: str
    description: str | None
    slug: str
    version: int
    thank_you_title: str
    thank_you_message: str
    questions: list["PublicQuestion"] = Field(default_factory=list)


from app.schemas.question import PublicQuestion, QuestionResponse  # noqa: E402

FormDetail.model_rebuild()
