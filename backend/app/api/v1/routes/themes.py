from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.theme import FormThemeUpdate
from app.services import theme_service

router = APIRouter(prefix="/forms")


@router.get("/{form_id}/theme")
async def get_form_theme(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Theme fetched successfully", await theme_service.get_theme(db, form_id))


@router.patch("/{form_id}/theme")
async def patch_form_theme(form_id: int, payload: FormThemeUpdate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Theme updated successfully", await theme_service.update_theme(db, form_id, payload))


@router.post("/{form_id}/theme/reset")
async def reset_form_theme(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Theme reset successfully", await theme_service.reset_theme(db, form_id))
