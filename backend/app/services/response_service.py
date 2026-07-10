import re
import csv
import io
from datetime import datetime, timezone
from math import ceil

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BusinessValidationError, ConflictError, NotFoundError
from app.core.timestamps import format_utc_timestamp
from app.models import Answer, Form, FormResponse, FormStatus, Question, QuestionType
from app.schemas.response import ResponseSubmission


def _validation(field: str, message: str) -> BusinessValidationError:
    return BusinessValidationError("Validation failed", [{"field": field, "message": message}])


async def _published_form(db: AsyncSession, slug: str) -> Form:
    result = await db.execute(select(Form).options(selectinload(Form.questions)).where(Form.slug == slug, Form.status == FormStatus.PUBLISHED))
    form = result.scalar_one_or_none()
    if form is None: raise NotFoundError("Public form not found")
    return form


def public_form_data(form: Form) -> dict:
    return {"id": form.id, "title": form.title, "description": form.description, "slug": form.slug, "version": form.version, "thank_you_title": form.thank_you_title, "thank_you_message": form.thank_you_message, "questions": [{"id": q.id, "type": q.type, "title": q.title, "description": q.description, "required": q.required, "position": q.position, "settings": q.settings_json, "version": q.version} for q in sorted(form.questions, key=lambda item: item.position)]}


def _missing(value: object) -> bool:
    return value is None or (isinstance(value, str) and not value.strip())


def _validate(question: Question, value: object, field: str) -> None:
    if _missing(value):
        if question.required: raise _validation(field, "This question is required")
        return
    settings = question.settings_json or {}
    if question.type in {QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT}:
        if not isinstance(value, str): raise _validation(field, "Enter text")
    elif question.type == QuestionType.EMAIL:
        if not isinstance(value, str) or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value.strip()): raise _validation(field, "Enter a valid email address")
    elif question.type == QuestionType.NUMBER:
        if isinstance(value, bool) or not isinstance(value, (int, float)): raise _validation(field, "Enter a valid number")
        if "min" in settings and value < settings["min"] or "max" in settings and value > settings["max"]: raise _validation(field, "Number is outside the allowed range")
    elif question.type in {QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN}:
        if not isinstance(value, str) or value not in settings.get("options", []): raise _validation(field, "Select a valid option")
    elif question.type == QuestionType.YES_NO:
        if not isinstance(value, bool): raise _validation(field, "Select yes or no")
    elif question.type == QuestionType.RATING:
        if type(value) is not int or value < settings.get("min", 1) or value > settings.get("max", 10): raise _validation(field, "Select a valid rating")


async def get_public_form(db: AsyncSession, slug: str) -> Form:
    return await _published_form(db, slug)


async def submit_response(db: AsyncSession, slug: str, payload: ResponseSubmission) -> dict:
    form = await _published_form(db, slug)
    if payload.form_version is not None and payload.form_version != form.version:
        raise ConflictError("This form changed. Reload the form and try again.")
    questions = {question.id: question for question in form.questions}
    submitted: set[int] = set()
    for index, answer in enumerate(payload.answers):
        field = f"answers.{index}.question_id"
        if answer.question_id in submitted: raise _validation(field, "Duplicate answer for this question")
        submitted.add(answer.question_id)
        question = questions.get(answer.question_id)
        if question is None: raise _validation(field, "Question does not belong to this form")
        _validate(question, answer.value, f"answers.{index}.value")
    for question in questions.values():
        if question.required and question.id not in submitted: raise _validation(f"question.{question.id}", "This question is required")
    response = FormResponse(form_id=form.id, form_version=form.version, completion_time_seconds=payload.completion_time_seconds)
    db.add(response); await db.flush()
    for answer in payload.answers:
        if answer.value is not None: db.add(Answer(response_id=response.id, question_id=answer.question_id, value_json=answer.value))
    await db.commit(); await db.refresh(response)
    return {"response_id": response.id, "submitted_at": response.submitted_at, "thank_you": {"title": form.thank_you_title, "message": form.thank_you_message}}


async def _creator_form(db: AsyncSession, form_id: int) -> Form:
    result = await db.execute(select(Form).options(selectinload(Form.questions)).where(Form.id == form_id, Form.creator_id == 1))
    form = result.scalar_one_or_none()
    if form is None: raise NotFoundError("Form not found")
    return form


def _meaningful(value: object) -> bool:
    return not _missing(value)


async def list_form_responses(db: AsyncSession, form_id: int, page: int, limit: int, order: str) -> dict:
    form = await _creator_form(db, form_id)
    total = await db.scalar(select(func.count()).select_from(FormResponse).where(FormResponse.form_id == form.id)) or 0
    ordering = (FormResponse.submitted_at.desc(), FormResponse.id.desc()) if order == "desc" else (FormResponse.submitted_at.asc(), FormResponse.id.asc())
    query = select(FormResponse).options(selectinload(FormResponse.answers).selectinload(Answer.question)).where(FormResponse.form_id == form.id).order_by(*ordering).offset((page - 1) * limit).limit(limit)
    responses = list((await db.scalars(query)).unique())
    items = []
    for response in responses:
        meaningful = sorted((answer for answer in response.answers if _meaningful(answer.value_json)), key=lambda item: item.question.position)
        items.append({"id": response.id, "submitted_at": response.submitted_at, "completion_time_seconds": response.completion_time_seconds, "answer_count": len(meaningful), "preview": [{"question_id": answer.question_id, "question_title": answer.question.title, "value": answer.value_json} for answer in meaningful[:3]]})
    return {"form": {"id": form.id, "title": form.title}, "items": items, "pagination": {"page": page, "limit": limit, "total": total, "total_pages": ceil(total / limit) if total else 0}}


async def get_response(db: AsyncSession, response_id: int) -> dict:
    result = await db.execute(select(FormResponse).options(selectinload(FormResponse.form), selectinload(FormResponse.answers).selectinload(Answer.question)).where(FormResponse.id == response_id))
    response = result.scalar_one_or_none()
    if response is None or response.form.creator_id != 1: raise NotFoundError("Response not found")
    answers = sorted(response.answers, key=lambda item: item.question.position)
    return {"id": response.id, "form": {"id": response.form.id, "title": response.form.title}, "submitted_at": response.submitted_at, "completion_time_seconds": response.completion_time_seconds, "answers": [{"question_id": answer.question_id, "question_title": answer.question.title, "question_type": answer.question.type, "value": answer.value_json} for answer in answers]}


async def delete_response(db: AsyncSession, response_id: int) -> None:
    result = await db.execute(select(FormResponse).options(selectinload(FormResponse.form)).where(FormResponse.id == response_id))
    response = result.scalar_one_or_none()
    if response is None or response.form.creator_id != 1: raise NotFoundError("Response not found")
    await db.delete(response); await db.commit()


def _csv_value(value: object) -> str | int | float:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, list):
        value = "; ".join(str(item) for item in value)
    if isinstance(value, str):
        return f"'{value}" if value.startswith(("=", "+", "-", "@")) else value
    return value  # numeric values retain their numeric representation


async def export_form_responses_csv(db: AsyncSession, form_id: int) -> tuple[str, str]:
    form = await _creator_form(db, form_id)
    questions = sorted(form.questions, key=lambda item: item.position)
    query = select(FormResponse).options(selectinload(FormResponse.answers)).where(FormResponse.form_id == form.id).order_by(FormResponse.submitted_at.asc(), FormResponse.id.asc())
    responses = list((await db.scalars(query)).unique())
    output = io.StringIO(newline="")
    writer = csv.writer(output)
    writer.writerow(["response_id", "submitted_at", "completion_time_seconds", *[f"{question.title} [{question.id}]" for question in questions]])
    question_ids = [question.id for question in questions]
    for response in responses:
        answers = {answer.question_id: answer.value_json for answer in response.answers}
        writer.writerow([response.id, format_utc_timestamp(response.submitted_at), response.completion_time_seconds if response.completion_time_seconds is not None else "", *[_csv_value(answers.get(question_id)) for question_id in question_ids]])
    filename_base = re.sub(r"[^a-z0-9]+", "-", form.title.lower()).strip("-") or "form"
    filename = f"{filename_base}-responses-{datetime.now(timezone.utc).date().isoformat()}.csv"
    return output.getvalue(), filename
