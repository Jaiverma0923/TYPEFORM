from typing import Any

from app.schemas.common import ORMModel


class AnalyticsAnswer(ORMModel):
    value: Any
    count: int


class QuestionAnalytics(ORMModel):
    question_id: int
    question_title: str
    question_type: str
    response_count: int
    answers: list[AnalyticsAnswer]


class Analytics(ORMModel):
    form_id: int
    total_responses: int
    started_responses: int
    completed_responses: int
    average_completion_time_seconds: int | float | None
    questions: list[QuestionAnalytics]
