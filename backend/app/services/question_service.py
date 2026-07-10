from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BusinessValidationError, NotFoundError
from app.models import Form, Question, QuestionType
from app.schemas.question import QuestionCreate, QuestionReorder, QuestionUpdate


def _error(field: str, message: str) -> BusinessValidationError:
    return BusinessValidationError("Validation failed", [{"field": field, "message": message}])


def _trim(value: str, field: str) -> str:
    value = value.strip()
    if not value: raise _error(field, "Must not be empty")
    return value


def _settings(question_type: QuestionType, raw: dict) -> dict:
    raw = raw or {}
    if question_type in {QuestionType.SHORT_TEXT, QuestionType.LONG_TEXT, QuestionType.EMAIL}:
        return {"placeholder": raw["placeholder"].strip()} if isinstance(raw.get("placeholder"), str) and raw["placeholder"].strip() else {}
    if question_type == QuestionType.NUMBER:
        out = {key: raw[key] for key in ("min", "max") if isinstance(raw.get(key), (int, float)) and not isinstance(raw[key], bool)}
        if isinstance(raw.get("placeholder"), str) and raw["placeholder"].strip(): out["placeholder"] = raw["placeholder"].strip()
        return out
    if question_type in {QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN}:
        if not isinstance(raw.get("options"), list): raise _error("settings.options", "Options are required")
        options = [item.strip() for item in raw["options"] if isinstance(item, str) and item.strip()]
        if not options: raise _error("settings.options", "At least one option is required")
        if len(set(options)) != len(options): raise _error("settings.options", "Options must be unique")
        return {"options": options}
    if question_type == QuestionType.YES_NO: return {}
    if question_type == QuestionType.RATING:
        minimum, maximum = raw.get("min"), raw.get("max")
        if type(minimum) is not int or type(maximum) is not int or not 1 <= minimum < maximum <= 10:
            raise _error("settings", "Rating min and max must be integers from 1 to 10 with min less than max")
        return {"min": minimum, "max": maximum}
    return {}


def question_data(question: Question) -> dict:
    return {"id": question.id, "form_id": question.form_id, "type": question.type, "title": question.title, "description": question.description, "required": question.required, "position": question.position, "settings": question.settings_json, "version": question.version, "created_at": question.created_at, "updated_at": question.updated_at}


async def _form(db: AsyncSession, form_id: int) -> Form:
    result = await db.execute(select(Form).options(selectinload(Form.questions)).where(Form.id == form_id, Form.creator_id == 1))
    form = result.scalar_one_or_none()
    if form is None: raise NotFoundError("Form not found")
    return form


async def _question(db: AsyncSession, question_id: int) -> Question:
    result = await db.execute(select(Question).options(selectinload(Question.form)).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if question is None or question.form.creator_id != 1: raise NotFoundError("Question not found")
    return question


async def create_question(db: AsyncSession, form_id: int, payload: QuestionCreate) -> Question:
    form = await _form(db, form_id)
    current_position = await db.scalar(select(func.max(Question.position)).where(Question.form_id == form_id))
    position = current_position + 1 if current_position is not None else 0
    question = Question(form_id=form_id, type=payload.type, title=_trim(payload.title, "title"), description=payload.description.strip() if payload.description else None, required=payload.required, position=position, settings_json=_settings(payload.type, payload.settings.model_dump(exclude_none=True)))
    db.add(question); form.version += 1; await db.commit(); await db.refresh(question); return question


async def update_question(db: AsyncSession, question_id: int, payload: QuestionUpdate) -> Question:
    question = await _question(db, question_id); form = question.form; changes = payload.model_dump(exclude_unset=True, exclude_none=False)
    final_type = changes.get("type", question.type)
    final_title = _trim(changes["title"], "title") if "title" in changes else question.title
    final_description = changes.get("description", question.description)
    if isinstance(final_description, str): final_description = final_description.strip() or None
    source_settings = changes.get("settings")
    raw = source_settings if source_settings is not None else question.settings_json
    question.type, question.title, question.description, question.required = final_type, final_title, final_description, changes.get("required", question.required)
    question.settings_json = _settings(final_type, raw); question.version += 1; form.version += 1
    await db.commit(); await db.refresh(question); return question


async def delete_question(db: AsyncSession, question_id: int) -> None:
    question = await _question(db, question_id); form = await _form(db, question.form_id)
    await db.delete(question); await db.flush()
    remaining = list((await db.scalars(select(Question).where(Question.form_id == form.id).order_by(Question.position))).all())
    temporary_start = max((item.position for item in remaining), default=-1) + len(remaining) + 1
    for index, item in enumerate(remaining): item.position = temporary_start + index
    await db.flush()
    for index, item in enumerate(remaining): item.position = index
    form.version += 1; await db.commit()


async def reorder_questions(db: AsyncSession, form_id: int, payload: QuestionReorder) -> dict:
    form = await _form(db, form_id); questions = list(form.questions); ids = payload.question_ids
    if len(ids) != len(set(ids)): raise _error("question_ids", "Question IDs must be unique")
    actual = {item.id for item in questions}
    if set(ids) != actual: raise _error("question_ids", "Question IDs must contain every question from this form exactly once")
    lookup = {item.id: item for item in questions}
    original_positions = {item.id: item.position for item in questions}
    temporary_start = max((item.position for item in questions), default=-1) + len(questions) + 1
    for index, item in enumerate(questions): item.position = temporary_start + index
    await db.flush()
    changed = []
    for index, question_id in enumerate(ids):
        item = lookup[question_id]
        if original_positions[item.id] != index: item.version += 1
        item.position = index; changed.append({"id": item.id, "position": index, "version": item.version})
    form.version += 1; await db.commit()
    return {"questions": changed, "form_version": form.version}
