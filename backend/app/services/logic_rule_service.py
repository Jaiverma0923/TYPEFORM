from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import BusinessValidationError, NotFoundError
from app.models import Form, LogicRule, Question
from app.schemas.logic_rule import LogicRuleCreate, LogicRuleReorder, LogicRuleUpdate


def _validation(field: str, message: str) -> BusinessValidationError:
    return BusinessValidationError("Validation failed", [{"field": field, "message": message}])


def logic_rule_data(rule: LogicRule) -> dict:
    return {"id": rule.id, "form_id": rule.form_id, "source_question_id": rule.source_question_id, "operator": rule.operator, "value": rule.comparison_value, "action": rule.action, "target_question_id": rule.destination_question_id, "priority": rule.priority, "created_at": rule.created_at, "updated_at": rule.updated_at}


async def _form(db: AsyncSession, form_id: int, with_rules: bool = False) -> Form:
    options = [selectinload(Form.questions)]
    if with_rules:
        options.append(selectinload(Form.logic_rules))
    result = await db.execute(select(Form).options(*options).where(Form.id == form_id, Form.creator_id == 1))
    form = result.scalar_one_or_none()
    if form is None:
        raise NotFoundError("Form not found")
    return form


async def _rule(db: AsyncSession, rule_id: int) -> LogicRule:
    result = await db.execute(select(LogicRule).options(selectinload(LogicRule.form).selectinload(Form.questions)).where(LogicRule.id == rule_id))
    rule = result.scalar_one_or_none()
    if rule is None or rule.form.creator_id != 1:
        raise NotFoundError("Logic rule not found")
    return rule


def _validate_questions(form: Form, source_question_id: int, target_question_id: int | None, action: str) -> None:
    questions = {question.id: question for question in form.questions}
    if source_question_id not in questions:
        raise _validation("source_question_id", "Source question does not belong to this form")
    if action == "go_to_question":
        if target_question_id is None:
            raise _validation("target_question_id", "Target question is required")
        if target_question_id not in questions:
            raise _validation("target_question_id", "Target question does not belong to this form")
        if source_question_id == target_question_id:
            raise _validation("target_question_id", "A logic rule cannot target its source question")
    elif target_question_id is not None:
        raise _validation("target_question_id", "Submit form rules cannot have a target question")


async def list_rules(db: AsyncSession, form_id: int) -> list[dict]:
    form = await _form(db, form_id, with_rules=True)
    return [logic_rule_data(rule) for rule in sorted(form.logic_rules, key=lambda item: (item.priority, item.id))]


async def create_rule(db: AsyncSession, form_id: int, payload: LogicRuleCreate) -> dict:
    form = await _form(db, form_id)
    _validate_questions(form, payload.source_question_id, payload.target_question_id, payload.action)
    priority = await db.scalar(select(func.max(LogicRule.priority)).where(LogicRule.form_id == form.id))
    rule = LogicRule(form_id=form.id, source_question_id=payload.source_question_id, destination_question_id=payload.target_question_id, operator=payload.operator, comparison_value=payload.value, action=payload.action, priority=(priority + 1 if priority is not None else 0))
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return logic_rule_data(rule)


async def update_rule(db: AsyncSession, rule_id: int, payload: LogicRuleUpdate) -> dict:
    rule = await _rule(db, rule_id)
    changes = payload.model_dump(exclude_unset=True)
    source_question_id = changes.get("source_question_id", rule.source_question_id)
    target_question_id = changes.get("target_question_id", rule.destination_question_id)
    action = changes.get("action", rule.action)
    _validate_questions(rule.form, source_question_id, target_question_id, action)
    if "source_question_id" in changes:
        rule.source_question_id = changes["source_question_id"]
    if "target_question_id" in changes:
        rule.destination_question_id = changes["target_question_id"]
    for field in ("operator", "value", "action"):
        if field in changes:
            setattr(rule, "comparison_value" if field == "value" else field, changes[field])
    await db.commit()
    await db.refresh(rule)
    return logic_rule_data(rule)


async def delete_rule(db: AsyncSession, rule_id: int) -> dict:
    rule = await _rule(db, rule_id)
    rule_id = rule.id
    await db.delete(rule)
    await db.commit()
    return {"id": rule_id}


async def reorder_rules(db: AsyncSession, form_id: int, payload: LogicRuleReorder) -> dict:
    form = await _form(db, form_id, with_rules=True)
    rules = list(form.logic_rules)
    requested_ids = payload.rule_ids
    if len(requested_ids) != len(set(requested_ids)):
        raise _validation("rule_ids", "Rule IDs must be unique")
    lookup = {rule.id: rule for rule in rules}
    if set(requested_ids) != set(lookup):
        raise _validation("rule_ids", "Rule IDs must contain every logic rule from this form exactly once")
    temporary_start = max((rule.priority for rule in rules), default=-1) + len(rules) + 1
    for index, rule in enumerate(rules):
        rule.priority = temporary_start + index
    await db.flush()
    for priority, rule_id in enumerate(requested_ids):
        lookup[rule_id].priority = priority
    await db.commit()
    return {"rule_ids": requested_ids, "form_id": form.id}
