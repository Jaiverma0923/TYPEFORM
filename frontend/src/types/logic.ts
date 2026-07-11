export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "is_answered"
  | "is_not_answered";

export type LogicAction = "go_to_question" | "submit_form";

export type LogicValue = string | number | boolean | null;

export interface LogicRule {
  id: number;
  form_id: number;
  source_question_id: number;
  operator: LogicOperator;
  value: LogicValue;
  action: LogicAction;
  target_question_id: number | null;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateLogicRulePayload {
  source_question_id: number;
  operator: LogicOperator;
  value: LogicValue;
  action: LogicAction;
  target_question_id: number | null;
}

export interface UpdateLogicRulePayload {
  source_question_id?: number;
  operator?: LogicOperator;
  value?: LogicValue;
  action?: LogicAction;
  target_question_id?: number | null;
}

export interface ReorderLogicRulesPayload {
  rule_ids: number[];
}
