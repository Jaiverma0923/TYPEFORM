from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import success_response
from app.db.database import get_db
from app.schemas.logic_rule import LogicRuleCreate, LogicRuleReorder, LogicRuleUpdate
from app.services import logic_rule_service

router = APIRouter()


@router.get("/forms/{form_id}/logic-rules")
async def get_logic_rules(form_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Logic rules fetched successfully", await logic_rule_service.list_rules(db, form_id))


@router.post("/forms/{form_id}/logic-rules", status_code=status.HTTP_201_CREATED)
async def create_logic_rule(form_id: int, payload: LogicRuleCreate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Logic rule created successfully", await logic_rule_service.create_rule(db, form_id, payload))


@router.patch("/logic-rules/{rule_id}")
async def patch_logic_rule(rule_id: int, payload: LogicRuleUpdate, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Logic rule updated successfully", await logic_rule_service.update_rule(db, rule_id, payload))


@router.delete("/logic-rules/{rule_id}")
async def delete_logic_rule(rule_id: int, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Logic rule deleted successfully", await logic_rule_service.delete_rule(db, rule_id))


@router.patch("/forms/{form_id}/logic-rules/reorder")
async def reorder_logic_rules(form_id: int, payload: LogicRuleReorder, db: AsyncSession = Depends(get_db)) -> dict:
    return success_response("Logic rules reordered successfully", await logic_rule_service.reorder_rules(db, form_id, payload))
