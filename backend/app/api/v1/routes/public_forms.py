from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.response import ResponseSubmission
from app.services import response_service

router = APIRouter(prefix="/public/forms")


@router.get("/{slug}")
async def get_public_form(slug: str, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Public form fetched successfully", response_service.public_form_data(await response_service.get_public_form(db, slug)))


@router.post("/{slug}/responses", status_code=status.HTTP_201_CREATED)
async def submit_response(slug: str, payload: ResponseSubmission, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Response submitted successfully", await response_service.submit_response(db, slug, payload))
