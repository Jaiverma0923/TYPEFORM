from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.draft import DraftUpdate
from app.services import draft_service

router = APIRouter()


@router.get("/public/{slug}/draft")
async def get_draft(slug: str, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Draft fetched successfully", await draft_service.get_draft(db, slug))


@router.post("/public/{slug}/draft", status_code=status.HTTP_201_CREATED)
async def create_draft(slug: str, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Draft created successfully", await draft_service.create_draft(db, slug))


@router.patch("/drafts/{draft_id}")
async def patch_draft(draft_id: int, payload: DraftUpdate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Draft updated successfully", await draft_service.update_draft(db, draft_id, payload))


@router.delete("/drafts/{draft_id}")
async def delete_draft(draft_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Draft deleted successfully", await draft_service.delete_draft(db, draft_id))
