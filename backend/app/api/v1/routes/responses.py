from typing import Literal

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.services import response_service

router = APIRouter()


@router.get("/forms/{form_id}/responses/export")
async def export_responses(form_id: int, db: AsyncSession = Depends(get_db)) -> Response:
    content, filename = await response_service.export_form_responses_csv(db, form_id)
    return Response(content=content, media_type="text/csv", headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.get("/forms/{form_id}/responses")
async def list_responses(form_id: int, page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100), sort: Literal["submitted_at"] = "submitted_at", order: Literal["asc", "desc"] = "desc", db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Responses fetched successfully", await response_service.list_form_responses(db, form_id, page, limit, order))


@router.get("/responses/{response_id}")
async def get_response(response_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Response fetched successfully", await response_service.get_response(db, response_id))


@router.delete("/responses/{response_id}")
async def delete_response(response_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    await response_service.delete_response(db, response_id); return success_response("Response deleted successfully", None)
