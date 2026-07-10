from typing import Literal

from pydantic import Field, model_validator

from app.schemas.common import ORMModel

LogicOperator = Literal["equals", "not_equals", "contains", "not_contains", "greater_than", "less_than", "is_answered", "is_not_answered"]
LogicAction = Literal["go_to_question", "submit_form"]
LogicValue = str | int | float | bool | None


class LogicRuleCreate(ORMModel):
    source_question_id: int = Field(gt=0)
    operator: LogicOperator
    value: LogicValue
    action: LogicAction
    target_question_id: int | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def validate_action_target(self) -> "LogicRuleCreate":
        if self.action == "go_to_question" and self.target_question_id is None:
            raise ValueError("target_question_id is required when action is go_to_question")
        if self.action == "submit_form" and self.target_question_id is not None:
            raise ValueError("target_question_id must be null when action is submit_form")
        return self


class LogicRuleUpdate(ORMModel):
    source_question_id: int | None = Field(default=None, gt=0)
    operator: LogicOperator | None = None
    value: LogicValue = None
    action: LogicAction | None = None
    target_question_id: int | None = Field(default=None, gt=0)


class LogicRuleReorder(ORMModel):
    rule_ids: list[int] = Field(default_factory=list)
