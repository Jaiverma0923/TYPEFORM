from datetime import datetime, timezone
from math import ceil
import re
from uuid import uuid4

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BusinessValidationError, NotFoundError
from app.models import Creator, Form, FormResponse, FormStatus, FormTheme, Question, QuestionType
from app.schemas.form import FormCreate, FormDuplicate, FormUpdate
from app.services.theme_service import DEFAULT_THEME, theme_data

DEFAULT_CREATOR_ID = 1


def _trim(value: str, field: str) -> str:
    value = value.strip()
    if not value:
        raise BusinessValidationError("Validation failed", [{"field": field, "message": "Must not be empty"}])
    return value


async def _default_creator(db: AsyncSession) -> Creator:
    creator = await db.get(Creator, DEFAULT_CREATOR_ID)
    if creator is None:
        creator = Creator(id=DEFAULT_CREATOR_ID, name="Default Creator", email="creator@example.com")
        db.add(creator)
        await db.flush()
    return creator


async def _form(db: AsyncSession, form_id: int) -> Form:
    result = await db.execute(select(Form).options(selectinload(Form.questions), selectinload(Form.responses), selectinload(Form.theme)).where(Form.id == form_id, Form.creator_id == DEFAULT_CREATOR_ID))
    form = result.scalar_one_or_none()
    if form is None:
        raise NotFoundError("Form not found")
    return form


def form_data(form: Form, detail: bool = False) -> dict:
    data = {"id": form.id, "title": form.title, "description": form.description, "slug": form.slug, "status": form.status, "version": form.version, "question_count": len(form.questions), "response_count": len(form.responses), "created_at": form.created_at, "updated_at": form.updated_at, "published_at": form.published_at}
    if detail:
        data.update({"thank_you_title": form.thank_you_title, "thank_you_message": form.thank_you_message, "questions": [{"id": q.id, "form_id": q.form_id, "type": q.type, "title": q.title, "description": q.description, "required": q.required, "position": q.position, "settings": q.settings_json, "version": q.version, "created_at": q.created_at, "updated_at": q.updated_at} for q in sorted(form.questions, key=lambda item: item.position)], "theme": theme_data(form.theme)})
    return data


async def list_forms(db: AsyncSession, status: FormStatus | None, search: str | None, sort: str, order: str, page: int, limit: int) -> dict:
    query: Select = select(Form).options(selectinload(Form.questions), selectinload(Form.responses)).where(Form.creator_id == DEFAULT_CREATOR_ID)
    if status: query = query.where(Form.status == status)
    if search:
        term = f"%{search.strip()}%"; query = query.where(or_(Form.title.ilike(term), Form.description.ilike(term)))
    total = await db.scalar(select(func.count()).select_from(query.subquery())) or 0
    columns = {"created_at": Form.created_at, "updated_at": Form.updated_at, "title": Form.title}
    if sort == "response_count":
        primary_order = select(func.count(FormResponse.id)).where(FormResponse.form_id == Form.id).scalar_subquery()
    else:
        primary_order = columns[sort]
    query = query.order_by(primary_order.desc(), Form.id.desc()) if order == "desc" else query.order_by(primary_order.asc(), Form.id.asc())
    result = await db.execute(query.offset((page - 1) * limit).limit(limit))
    return {"items": [form_data(item) for item in result.scalars().unique()], "pagination": {"page": page, "limit": limit, "total": total, "total_pages": ceil(total / limit) if total else 0}}


async def create_form(db: AsyncSession, payload: FormCreate) -> Form:
    await _default_creator(db)
    form = Form(creator_id=DEFAULT_CREATOR_ID, title=_trim(payload.title, "title"), description=payload.description, thank_you_title=_trim(payload.thank_you_title, "thank_you_title"), thank_you_message=payload.thank_you_message.strip())
    form.theme = FormTheme(**DEFAULT_THEME)
    db.add(form); await db.commit()
    return await _form(db, form.id)


async def update_form(db: AsyncSession, form_id: int, payload: FormUpdate) -> Form:
    form = await _form(db, form_id); changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        if isinstance(value, str): value = _trim(value, field) if field in {"title", "thank_you_title"} else value.strip()
        setattr(form, field, value)
    if changes: form.version += 1
    await db.commit(); return await _form(db, form.id)


async def delete_form(db: AsyncSession, form_id: int) -> None:
    form = await _form(db, form_id); await db.delete(form); await db.commit()


async def duplicate_form(db: AsyncSession, form_id: int, payload: FormDuplicate) -> Form:
    source = await _form(db, form_id); title = _trim(payload.title, "title") if payload.title is not None else f"{source.title} Copy"
    duplicate = Form(creator_id=DEFAULT_CREATOR_ID, title=title, description=source.description, thank_you_title=source.thank_you_title, thank_you_message=source.thank_you_message)
    for question in source.questions:
        duplicate.questions.append(Question(type=question.type, title=question.title, description=question.description, required=question.required, position=question.position, settings_json=question.settings_json.copy(), version=question.version))
    duplicate.theme = FormTheme(**DEFAULT_THEME)
    db.add(duplicate); await db.commit(); return await _form(db, duplicate.id)


def _slug(title: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "form"
    return f"{base}-{uuid4().hex[:6]}"


async def publish_form(db: AsyncSession, form_id: int, frontend_base_url: str) -> dict:
    form = await _form(db, form_id)
    if not form.questions: raise BusinessValidationError("Form cannot be published", [{"field": "questions", "message": "At least one question is required"}])
    _trim(form.title, "title")
    for question in form.questions:
        _trim(question.title, "questions.title")
        settings = question.settings_json or {}
        if question.type in {QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN} and not settings.get("options"):
            raise BusinessValidationError("Form cannot be published", [{"field": "questions.settings.options", "message": "At least one option is required"}])
        if question.type == QuestionType.RATING:
            minimum, maximum = settings.get("min"), settings.get("max")
            if not isinstance(minimum, (int, float)) or not isinstance(maximum, (int, float)) or minimum > maximum or minimum < 1 or maximum > 10:
                raise BusinessValidationError("Form cannot be published", [{"field": "questions.settings", "message": "Rating requires min and max between 1 and 10"}])
    form.slug = form.slug or _slug(form.title); form.status = FormStatus.PUBLISHED; form.published_at = datetime.now(timezone.utc); form.version += 1
    await db.commit()
    return {"id": form.id, "status": form.status, "slug": form.slug, "public_url": f"{frontend_base_url.rstrip('/')}/form/{form.slug}", "published_at": form.published_at, "version": form.version}


async def unpublish_form(db: AsyncSession, form_id: int) -> dict:
    form = await _form(db, form_id); form.status = FormStatus.DRAFT; form.published_at = None; form.version += 1; await db.commit()
    return {"id": form.id, "status": form.status, "slug": form.slug, "published_at": None, "version": form.version}
