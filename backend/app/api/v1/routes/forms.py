from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.responses import success_response
from app.db.database import get_db
from app.models import FormStatus
from app.schemas.form import FormCreate, FormDuplicate, FormUpdate
from app.services import form_service

router = APIRouter(prefix="/forms")


@router.get("")
async def get_forms(status_filter: FormStatus | None = Query(None, alias="status"), search: str | None = None, sort: Literal["created_at", "updated_at", "title", "response_count"] = "created_at", order: Literal["asc", "desc"] = "desc", page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Forms fetched successfully", await form_service.list_forms(db, status_filter, search, sort, order, page, limit))


@router.post("", status_code=status.HTTP_201_CREATED)
async def post_form(payload: FormCreate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Form created successfully", form_service.form_data(await form_service.create_form(db, payload), detail=True))


@router.get("/{form_id}")
async def get_form(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Form fetched successfully", form_service.form_data(await form_service._form(db, form_id), detail=True))


@router.patch("/{form_id}")
async def patch_form(form_id: int, payload: FormUpdate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Form updated successfully", form_service.form_data(await form_service.update_form(db, form_id, payload), detail=True))


@router.delete("/{form_id}")
async def delete_form(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    await form_service.delete_form(db, form_id); return success_response("Form deleted successfully", None)


@router.post("/{form_id}/duplicate", status_code=status.HTTP_201_CREATED)
async def duplicate_form(form_id: int, payload: FormDuplicate = FormDuplicate(), db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Form duplicated successfully", form_service.form_data(await form_service.duplicate_form(db, form_id, payload), detail=True))


@router.post("/{form_id}/publish")
async def publish_form(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Form published successfully", await form_service.publish_form(db, form_id, get_settings().frontend_base_url))


@router.post("/{form_id}/unpublish")
async def unpublish_form(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Form unpublished successfully", await form_service.unpublish_form(db, form_id))
