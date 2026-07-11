from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BusinessValidationError, ConflictError, NotFoundError
from app.models import DraftResponse, Form, FormStatus
from app.schemas.draft import DraftUpdate


def _validation(field: str, message: str) -> BusinessValidationError:
    return BusinessValidationError("Validation failed", [{"field": field, "message": message}])


def draft_data(draft: DraftResponse) -> dict:
    return {"id": draft.id, "form_id": draft.form_id, "slug": draft.form.slug, "form_version": draft.form_version, "answers": draft.answers_json, "current_question_id": draft.current_question_id, "visited_question_ids": draft.visited_question_ids, "started_at": draft.started_at, "last_saved_at": draft.last_saved_at, "completed": draft.completed}


async def _published_form(db: AsyncSession, slug: str) -> Form:
    result = await db.execute(select(Form).options(selectinload(Form.questions), selectinload(Form.draft_response)).where(Form.slug == slug, Form.status == FormStatus.PUBLISHED))
    form = result.scalar_one_or_none()
    if form is None:
        raise NotFoundError("Public form not found")
    return form


def _validate_question_ids(form: Form, answers: list[dict] | None, current_question_id: int | None, visited_question_ids: list[int] | None) -> None:
    valid_question_ids = {question.id for question in form.questions}
    if answers is not None:
        for index, answer in enumerate(answers):
            if answer["question_id"] not in valid_question_ids:
                raise _validation(f"answers.{index}.question_id", "Question does not belong to this form")
    if current_question_id is not None and current_question_id not in valid_question_ids:
        raise _validation("current_question_id", "Question does not belong to this form")
    if visited_question_ids is not None:
        for index, question_id in enumerate(visited_question_ids):
            if question_id not in valid_question_ids:
                raise _validation(f"visited_question_ids.{index}", "Question does not belong to this form")


async def get_draft(db: AsyncSession, slug: str) -> dict | None:
    form = await _published_form(db, slug)
    return draft_data(form.draft_response) if form.draft_response is not None else None


async def create_draft(db: AsyncSession, slug: str) -> dict:
    form = await _published_form(db, slug)
    if form.draft_response is not None:
        return draft_data(form.draft_response)
    questions = sorted(form.questions, key=lambda item: item.position)
    if not questions:
        raise _validation("questions", "A draft requires at least one question")
    draft = DraftResponse(form_id=form.id, answers_json=[], current_question_id=questions[0].id, visited_question_ids=[questions[0].id], form_version=form.version)
    db.add(draft)
    await db.commit()
    result = await db.execute(select(DraftResponse).options(selectinload(DraftResponse.form)).where(DraftResponse.id == draft.id))
    return draft_data(result.scalar_one())


async def _draft(db: AsyncSession, draft_id: int) -> DraftResponse:
    result = await db.execute(select(DraftResponse).options(selectinload(DraftResponse.form).selectinload(Form.questions)).where(DraftResponse.id == draft_id))
    draft = result.scalar_one_or_none()
    if draft is None or draft.form.status != FormStatus.PUBLISHED:
        raise NotFoundError("Draft not found")
    return draft


async def update_draft(db: AsyncSession, draft_id: int, payload: DraftUpdate) -> dict:
    draft = await _draft(db, draft_id)
    changes = {field: value for field, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    if "form_version" in changes and changes["form_version"] != draft.form.version:
        raise ConflictError("This form changed. Reload the form and try again.")
    answers = changes.get("answers")
    _validate_question_ids(draft.form, answers, changes.get("current_question_id"), changes.get("visited_question_ids"))
    if answers is not None:
        draft.answers_json = answers
    for field in ("form_version", "current_question_id", "visited_question_ids", "started_at", "completed"):
        if field in changes:
            setattr(draft, field, changes[field])
    await db.commit()
    await db.refresh(draft)
    return draft_data(draft)


async def delete_draft(db: AsyncSession, draft_id: int) -> dict:
    draft = await _draft(db, draft_id)
    deleted_id = draft.id
    await db.delete(draft)
    await db.commit()
    return {"id": deleted_id}
