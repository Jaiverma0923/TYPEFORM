from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.services.analytics_service import form_analytics

router = APIRouter()


@router.get("/forms/{form_id}/analytics")
async def get_analytics(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Analytics fetched successfully", await form_analytics(db, form_id))
