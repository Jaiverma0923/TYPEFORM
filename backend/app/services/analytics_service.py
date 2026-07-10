from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.models import Form, FormResponse, QuestionType


async def form_analytics(db: AsyncSession, form_id: int) -> dict:
    result = await db.execute(select(Form).options(selectinload(Form.questions), selectinload(Form.responses).selectinload(FormResponse.answers)).where(Form.id == form_id, Form.creator_id == 1))
    form = result.scalar_one_or_none()
    if form is None: raise NotFoundError("Form not found")
    responses = form.responses; total = len(responses)
    times = [item.completion_time_seconds for item in responses if item.completion_time_seconds is not None]
    questions = []
    for question in sorted(form.questions, key=lambda item: item.position):
        values = [answer.value_json for response in responses for answer in response.answers if answer.question_id == question.id and answer.value_json is not None and not (isinstance(answer.value_json, str) and not answer.value_json.strip())]
        answered = len(values); settings = question.settings_json or {}; summary = None
        if question.type in {QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN}:
            summary = {"counts": [{"label": option, "count": values.count(option), "percentage": round((values.count(option) / answered * 100) if answered else 0, 2)} for option in settings.get("options", [])]}
        elif question.type == QuestionType.RATING:
            minimum, maximum = settings.get("min", 1), settings.get("max", 10)
            summary = {"average": round(sum(values) / answered, 2) if answered else None, "distribution": [{"value": value, "count": values.count(value)} for value in range(minimum, maximum + 1)]}
        elif question.type == QuestionType.YES_NO:
            summary = {"yes": values.count(True), "no": values.count(False)}
        questions.append({"question_id": question.id, "title": question.title, "type": question.type, "answered_count": answered, "skipped_count": total - answered, "summary": summary})
    return {"form_id": form.id, "form_title": form.title, "total_responses": total, "average_completion_time_seconds": round(sum(times) / len(times), 2) if times else None, "questions": questions}
