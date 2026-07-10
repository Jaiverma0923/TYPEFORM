from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.question import QuestionCreate, QuestionReorder, QuestionUpdate
from app.services import question_service

router = APIRouter()


@router.post("/forms/{form_id}/questions", status_code=status.HTTP_201_CREATED)
async def create_question(form_id: int, payload: QuestionCreate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Question created successfully", question_service.question_data(await question_service.create_question(db, form_id, payload)))


@router.patch("/questions/{question_id}")
async def update_question(question_id: int, payload: QuestionUpdate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Question updated successfully", question_service.question_data(await question_service.update_question(db, question_id, payload)))


@router.delete("/questions/{question_id}")
async def delete_question(question_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    await question_service.delete_question(db, question_id); return success_response("Question deleted successfully", None)


@router.patch("/forms/{form_id}/questions/reorder")
async def reorder_questions(form_id: int, payload: QuestionReorder, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Questions reordered successfully", await question_service.reorder_questions(db, form_id, payload))
