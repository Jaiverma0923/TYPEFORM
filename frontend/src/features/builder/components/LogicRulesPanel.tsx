"use client";

import { AlertCircle, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
  getLogicRuleSummary,
  getSupportedOperators,
  operatorNeedsValue,
  validateLogicRule,
  validateLogicRules,
} from "@/features/logic/rules";
import type { CreateLogicRulePayload, LogicOperator, LogicRule, LogicValue, UpdateLogicRulePayload } from "@/types/logic";
import type { Question } from "@/types/question";

type LogicRulesPanelProps = {
  formId: number;
  pending: boolean;
  questions: Question[];
  rules: LogicRule[];
  onAddRule: (payload: CreateLogicRulePayload) => Promise<void>;
  onDeleteRule: (rule_id: number) => Promise<void>;
  onReorderRules: (rules: LogicRule[]) => Promise<void>;
  onUpdateRule: (rule_id: number, payload: UpdateLogicRulePayload) => Promise<void>;
};

type DraftRule = {
  source_question_id: number;
  operator: LogicOperator;
  value: LogicValue;
  action: "go_to_question" | "submit_form";
  target_question_id: number | null;
};

const operatorLabels: Record<LogicOperator, string> = {
  equals: "equals",
  not_equals: "does not equal",
  contains: "contains",
  not_contains: "does not contain",
  greater_than: "is greater than",
  less_than: "is less than",
  is_answered: "is answered",
  is_not_answered: "is not answered",
};

function orderedQuestions(questions: Question[]) {
  return questions.toSorted((a, b) => a.position - b.position);
}

function defaultValueForQuestion(question: Question, operator: LogicOperator): LogicValue {
  if (!operatorNeedsValue(operator)) {
    return null;
  }

  if (question.type === "yes_no") {
    return true;
  }

  if (question.type === "number" || question.type === "rating") {
    return question.settings.min ?? 1;
  }

  if (question.type === "multiple_choice" || question.type === "dropdown") {
    return question.settings.options?.[0] ?? "";
  }

  return "";
}

function toDraft(rule: LogicRule): DraftRule {
  return {
    source_question_id: rule.source_question_id,
    operator: rule.operator,
    value: rule.value,
    action: rule.action,
    target_question_id: rule.target_question_id,
  };
}

function createInitialDraft(questions: Question[]): DraftRule | null {
  const ordered = orderedQuestions(questions);

  const source = ordered[0];
  const target = ordered[1];

  if (!source) {
    return null;
  }

  const operator = getSupportedOperators(source.type)[0];
  return {
    source_question_id: source.id,
    operator,
    value: defaultValueForQuestion(source, operator),
    action: target ? "go_to_question" : "submit_form",
    target_question_id: target?.id ?? null,
  };
}

function buildRuleFromDraft(draft: DraftRule, formId: number, priority: number): LogicRule {
  const now = new Date().toISOString();
  return {
    id: 1,
    form_id: formId,
    ...draft,
    priority,
    created_at: now,
    updated_at: now,
  };
}

function ValueEditor({
  draft,
  onChange,
  source,
}: {
  draft: DraftRule;
  onChange: (value: LogicValue) => void;
  source: Question;
}) {
  if (!operatorNeedsValue(draft.operator)) {
    return <p className="rounded-md bg-page px-3 py-2 text-sm text-secondary">No value needed.</p>;
  }

  if (source.type === "yes_no") {
    return (
      <select
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
        value={String(draft.value)}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (source.type === "multiple_choice" || source.type === "dropdown") {
    return (
      <select
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
        value={typeof draft.value === "string" ? draft.value : ""}
        onChange={(event) => onChange(event.target.value)}
      >
        {(source.settings.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (source.type === "number" || source.type === "rating") {
    return (
      <input
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
        type="number"
        value={typeof draft.value === "number" ? draft.value : ""}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    );
  }

  return (
    <input
      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
      value={typeof draft.value === "string" ? draft.value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function LogicRulesPanel({
  formId,
  onAddRule,
  onDeleteRule,
  onReorderRules,
  onUpdateRule,
  pending,
  questions,
  rules,
}: LogicRulesPanelProps) {
  const sortedQuestions = useMemo(() => orderedQuestions(questions), [questions]);
  const questionNumbers = useMemo(() => new Map(sortedQuestions.map((question, index) => [question.id, index + 1]),), [sortedQuestions],);
  const [drafts, setDrafts] = useState<Record<number, DraftRule>>({});
  const [newDraft, setNewDraft] = useState<DraftRule | null>(() => createInitialDraft(questions));
  const validation = validateLogicRules(rules, questions);

  function getDraft(rule: LogicRule) {
    return drafts[rule.id] ?? toDraft(rule);
  }

  function updateDraft(rule: LogicRule, updater: (draft: DraftRule) => DraftRule) {
    setDrafts((current) => ({
      ...current,
      [rule.id]: updater(getDraft(rule)),
    }));
  }

  function RuleEditor({
    draft,
    onChange,
  }: {
    draft: DraftRule;
    onChange: (draft: DraftRule) => void;
  }) {
    const source = sortedQuestions.find((question) => question.id === draft.source_question_id) ?? sortedQuestions[0];
    const operators = source ? getSupportedOperators(source.type) : [];
    const sourceIndex = sortedQuestions.findIndex(
      (question) => question.id === source.id,
    );

    const targets =
      sourceIndex >= 0
        ? sortedQuestions.slice(sourceIndex + 1)
        : [];

    if (!source) {
      return <p className="text-sm text-secondary">Add questions before creating logic rules.</p>;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-normal text-secondary">When</h3>
          <label className="block text-sm font-medium text-primary">
            Source question
            <select
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
              value={draft.source_question_id}
              onChange={(event) => {
                const nextSource = sortedQuestions.find((question) => question.id === Number(event.target.value)) ?? source;
                const nextOperator = getSupportedOperators(nextSource.type)[0];
                const nextSourceIndex = sortedQuestions.findIndex(
                  (question) => question.id === nextSource.id,
                );

                const nextTarget = sortedQuestions[nextSourceIndex + 1];
                onChange({
                  source_question_id: nextSource.id,
                  operator: nextOperator,
                  value: defaultValueForQuestion(nextSource, nextOperator),
                  action: nextTarget ? draft.action : "submit_form",
                  target_question_id: draft.action === "go_to_question" ? nextTarget?.id ?? null : null,
                });
              }}
            >
              {sortedQuestions.map((question, index) => (
                <option key={question.id} value={question.id}>
                  {index + 1}. {question.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-primary">
            Operator
            <select
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
              value={draft.operator}
              onChange={(event) => {
                const operator = event.target.value as LogicOperator;
                onChange({
                  ...draft,
                  operator,
                  value: defaultValueForQuestion(source, operator),
                });
              }}
            >
              {operators.map((operator) => (
                <option key={operator} value={operator}>
                  {operatorLabels[operator]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-primary">
            Value
            <div className="mt-1">
              <ValueEditor
                draft={draft}
                source={source}
                onChange={(value) => onChange({ ...draft, value })}
              />
            </div>
          </label>
        </div>
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-normal text-secondary">Then</h3>
          <label className="block text-sm font-medium text-primary">
            Action
            <select
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
              value={draft.action}
              onChange={(event) => {
                const action = event.target.value as DraftRule["action"];
                onChange({
                  ...draft,
                  action,
                  target_question_id: action === "go_to_question" ? targets[0]?.id ?? null : null,
                });
              }}
            >
              <option value="go_to_question">Go to question</option>
              <option value="submit_form">Submit form</option>
            </select>
          </label>
          {draft.action === "go_to_question" ? (
            <label className="block text-sm font-medium text-primary">
              Target question
              <select
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                value={draft.target_question_id ?? ""}
                onChange={(event) => onChange({ ...draft, target_question_id: Number(event.target.value) })}
              >
                {targets.length === 0 ? <option value="">No later questions</option> : null}
                {targets.map((question) => (
                  <option key={question.id} value={question.id}>
                    {questionNumbers.get(question.id)}. {question.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <aside className="min-h-0 overflow-y-auto border-l border-border bg-surface p-4">
      <div className="space-y-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-normal text-secondary">
            Logic
          </h2>
          <p className="mt-1 text-xs text-secondary">
            Rules run by priority. First matching rule wins.
          </p>
        </div>

        {validation.some((result) => !result.valid) ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Some rules are invalid. Fix them before publishing.
          </div>
        ) : null}

        {newDraft ? (
          <section className="rounded-lg border border-border bg-surface p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">New rule</h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-accent px-3 py-2 text-sm font-medium text-surface disabled:opacity-50"
                disabled={pending}
                onClick={() => onAddRule(newDraft)}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add
              </button>
            </div>
            <RuleEditor draft={newDraft} onChange={setNewDraft} />
          </section>
        ) : null}

        <div className="space-y-3">
          {rules.length === 0 ? (
            <p className="rounded-md bg-page p-4 text-sm text-secondary">
              No logic rules yet. Add a rule to branch respondents based on an answer.
            </p>
          ) : null}
          {rules.map((rule, index) => {
            const draft = getDraft(rule);
            const draftRule = buildRuleFromDraft(draft, formId, rule.priority);
            const result = validateLogicRule({ ...draftRule, id: rule.id }, questions);

            return (
              <section key={rule.id} className="rounded-lg border border-border bg-surface p-3">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase text-secondary">
                      Priority {rule.priority + 1}
                    </p>
                    <p className="mt-1 text-sm text-secondary">
                      {getLogicRuleSummary(rule, questions)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Move rule up"
                      className="rounded-md border border-border p-2 text-primary disabled:opacity-40"
                      disabled={index === 0 || pending}
                      onClick={() => {
                        const next = [...rules];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        void onReorderRules(next);
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move rule down"
                      className="rounded-md border border-border p-2 text-primary disabled:opacity-40"
                      disabled={index === rules.length - 1 || pending}
                      onClick={() => {
                        const next = [...rules];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        void onReorderRules(next);
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete rule"
                      className="rounded-md border border-red-200 p-2 text-red-700 disabled:opacity-40"
                      disabled={pending}
                      onClick={() => void onDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <RuleEditor draft={draft} onChange={(nextDraft) => updateDraft(rule, () => nextDraft)} />
                {result.errors.length > 0 ? (
                  <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
                    <div className="flex gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <div>
                        {result.errors.map((error) => (
                          <p key={error}>{error}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-surface disabled:opacity-50"
                    disabled={pending || !result.valid}
                    onClick={() => onUpdateRule(rule.id, draft)}
                  >
                    Save rule
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
