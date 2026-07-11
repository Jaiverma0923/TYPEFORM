import type { LogicOperator, LogicRule, LogicValue } from "@/types/logic";
import type { Question, QuestionType } from "@/types/question";
import type { ResponseAnswer } from "@/types/response";

export type LogicEvaluationResult =
  | {
      action: "go_to_question";
      target_question_id: number;
    }
  | {
      action: "submit_form";
      target_question_id: null;
    };

export type LogicValidationResult = {
  valid: boolean;
  errors: string[];
};

const operatorSupport: Record<QuestionType, LogicOperator[]> = {
  short_text: ["equals", "not_equals", "contains", "not_contains", "is_answered", "is_not_answered"],
  long_text: ["equals", "not_equals", "contains", "not_contains", "is_answered", "is_not_answered"],
  email: ["equals", "not_equals", "contains", "not_contains", "is_answered", "is_not_answered"],
  number: ["equals", "not_equals", "greater_than", "less_than", "is_answered", "is_not_answered"],
  multiple_choice: ["equals", "not_equals", "is_answered", "is_not_answered"],
  dropdown: ["equals", "not_equals", "is_answered", "is_not_answered"],
  yes_no: ["equals", "not_equals", "is_answered", "is_not_answered"],
  rating: ["equals", "not_equals", "greater_than", "less_than", "is_answered", "is_not_answered"],
};

const valuelessOperators = new Set<LogicOperator>(["is_answered", "is_not_answered"]);

export function getSupportedOperators(type: QuestionType) {
  return operatorSupport[type];
}

export function operatorNeedsValue(operator: LogicOperator) {
  return !valuelessOperators.has(operator);
}

export function isMeaningfulAnswer(value: ResponseAnswer["value"] | LogicValue | undefined) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function getQuestion(question_id: number, questions: Question[]) {
  return questions.find((question) => question.id === question_id) ?? null;
}

function normalizeComparableValue(question: Question, value: ResponseAnswer["value"] | LogicValue | undefined) {
  if (!isMeaningfulAnswer(value)) {
    return null;
  }

  if (question.type === "number" || question.type === "rating") {
    if (typeof value === "boolean" || Array.isArray(value)) {
      return null;
    }

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  if (question.type === "yes_no") {
    return typeof value === "boolean" ? value : null;
  }

  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : null;
}

function valuesEqual(question: Question, answer: ResponseAnswer["value"] | undefined, expected: LogicValue) {
  const answerValue = normalizeComparableValue(question, answer);
  const expectedValue = normalizeComparableValue(question, expected);
  return answerValue === expectedValue;
}

function ruleMatches(rule: LogicRule, question: Question, answer: ResponseAnswer["value"] | undefined) {
  if (rule.operator === "is_answered") {
    return isMeaningfulAnswer(answer);
  }

  if (rule.operator === "is_not_answered") {
    return !isMeaningfulAnswer(answer);
  }

  if (rule.operator === "equals") {
    return valuesEqual(question, answer, rule.value);
  }

  if (rule.operator === "not_equals") {
    return !valuesEqual(question, answer, rule.value);
  }

  if (rule.operator === "contains" || rule.operator === "not_contains") {
    const answerValue = typeof answer === "string" ? answer.toLowerCase() : "";
    const expectedValue = typeof rule.value === "string" ? rule.value.toLowerCase() : "";
    const contains = answerValue.includes(expectedValue);
    return rule.operator === "contains" ? contains : !contains;
  }

  if (rule.operator === "greater_than" || rule.operator === "less_than") {
    const answerValue = normalizeComparableValue(question, answer);
    const expectedValue = normalizeComparableValue(question, rule.value);

    if (typeof answerValue !== "number" || typeof expectedValue !== "number") {
      return false;
    }

    return rule.operator === "greater_than"
      ? answerValue > expectedValue
      : answerValue < expectedValue;
  }

  return false;
}

export function validateLogicRule(rule: LogicRule, questions: Question[]): LogicValidationResult {
  const errors: string[] = [];
  const source = getQuestion(rule.source_question_id, questions);
  const target = rule.target_question_id ? getQuestion(rule.target_question_id, questions) : null;

  if (!source) {
    errors.push("Source question no longer exists.");
  }

  if (source && !getSupportedOperators(source.type).includes(rule.operator)) {
    errors.push("Operator is not supported for the selected source question.");
  }

  if (source && operatorNeedsValue(rule.operator)) {
    if (!isMeaningfulAnswer(rule.value)) {
      errors.push("Comparison value is required.");
    }

    if ((source.type === "multiple_choice" || source.type === "dropdown") && typeof rule.value === "string") {
      const options = source.settings.options ?? [];

      if (!options.includes(rule.value)) {
        errors.push("Comparison value must match one of the question options.");
      }
    }

    if (source.type === "yes_no" && typeof rule.value !== "boolean") {
      errors.push("Yes/no comparison value must be true or false.");
    }

    if ((source.type === "number" || source.type === "rating") && typeof rule.value !== "number") {
      errors.push("Numeric comparison value must be a number.");
    }
  }

  if (!operatorNeedsValue(rule.operator) && rule.value !== null) {
    errors.push("This operator must not store a comparison value.");
  }

  if (rule.action === "go_to_question") {
    if (!target) {
      errors.push("Target question is required.");
    }

    if (source && target && target.id === source.id) {
      errors.push("Target question cannot be the same as the source question.");
    }

    if (source && target && target.position <= source.position) {
      errors.push("Target question must come after the source question.");
    }
  }

  if (rule.action === "submit_form" && rule.target_question_id !== null) {
    errors.push("Submit form rules cannot have a target question.");
  }

  if (!Number.isInteger(rule.priority) || rule.priority < 0) {
    errors.push("Priority must be a zero-based integer.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateLogicRules(rules: LogicRule[], questions: Question[]) {
  return rules.map((rule) => ({
    rule,
    ...validateLogicRule(rule, questions),
  }));
}

export function evaluateLogicRules({
  answer,
  current_question,
  questions,
  rules,
}: {
  answer: ResponseAnswer["value"] | undefined;
  current_question: Question;
  questions: Question[];
  rules: LogicRule[];
}): LogicEvaluationResult | null {
  const matchingRules = rules
    .filter((rule) => rule.source_question_id === current_question.id)
    .toSorted((a, b) => a.priority - b.priority);

  for (const rule of matchingRules) {
    if (!validateLogicRule(rule, questions).valid) {
      continue;
    }

    if (!ruleMatches(rule, current_question, answer)) {
      continue;
    }

    if (rule.action === "submit_form") {
      return {
        action: "submit_form",
        target_question_id: null,
      };
    }

    if (rule.target_question_id !== null) {
      return {
        action: "go_to_question",
        target_question_id: rule.target_question_id,
      };
    }
  }

  return null;
}

export function getNextQuestionId(current_question_id: number, questions: Question[]) {
  const ordered = questions.toSorted((a, b) => a.position - b.position);
  const currentIndex = ordered.findIndex((question) => question.id === current_question_id);
  return currentIndex < 0 ? null : ordered[currentIndex + 1]?.id ?? null;
}

export function getLogicRuleSummary(rule: LogicRule, questions: Question[]) {
  const source = getQuestion(rule.source_question_id, questions);
  const target = rule.target_question_id ? getQuestion(rule.target_question_id, questions) : null;
  const value = rule.value === null ? "" : ` "${String(rule.value)}"`;
  const when = source
    ? `When "${source.title}" ${rule.operator.replaceAll("_", " ")}${value}`
    : "When a missing question is answered";
  const then =
    rule.action === "submit_form"
      ? "Submit form"
      : target
        ? `Go to "${target.title}"`
        : "Go to a missing question";

  return `${when} -> ${then}`;
}
