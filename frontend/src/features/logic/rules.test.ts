import assert from "node:assert/strict";
import test from "node:test";

import type { LogicRule } from "@/types/logic";
import type { Question } from "@/types/question";

import {
  evaluateLogicRules,
  getNextQuestionId,
  getSupportedOperators,
  isMeaningfulAnswer,
  validateLogicRule,
} from "./rules.ts";

const now = "2026-07-10T00:00:00.000Z";
const questions: Question[] = [
  {
    id: 1,
    form_id: 1,
    type: "yes_no",
    title: "Continue?",
    description: null,
    required: true,
    position: 0,
    settings: {},
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 2,
    form_id: 1,
    type: "number",
    title: "Age",
    description: null,
    required: false,
    position: 1,
    settings: {},
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    form_id: 1,
    type: "long_text",
    title: "Details",
    description: null,
    required: false,
    position: 2,
    settings: {},
    version: 1,
    created_at: now,
    updated_at: now,
  },
];

function rule(overrides: Partial<LogicRule>): LogicRule {
  return {
    id: 1,
    form_id: 1,
    source_question_id: 1,
    operator: "equals",
    value: false,
    action: "go_to_question",
    target_question_id: 3,
    priority: 0,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

test("operator compatibility is central and type-specific", () => {
  assert.ok(getSupportedOperators("number").includes("greater_than"));
  assert.equal(getSupportedOperators("multiple_choice").includes("contains"), false);
});

test("logic validation enforces action target and forward jumps", () => {
  assert.equal(validateLogicRule(rule({}), questions).valid, true);
  assert.equal(validateLogicRule(rule({ target_question_id: 1 }), questions).valid, false);
  assert.equal(validateLogicRule(rule({ action: "submit_form", target_question_id: 3 }), questions).valid, false);
});

test("meaningful answers treat false and zero as answered", () => {
  assert.equal(isMeaningfulAnswer(false), true);
  assert.equal(isMeaningfulAnswer(0), true);
  assert.equal(isMeaningfulAnswer("   "), false);
});

test("evaluation supports priority, comparisons and no-match behavior", () => {
  const result = evaluateLogicRules({
    current_question: questions[0],
    answer: false,
    questions,
    rules: [
      rule({ id: 2, priority: 1, action: "submit_form", target_question_id: null }),
      rule({ id: 1, priority: 0, target_question_id: 3 }),
    ],
  });

  assert.deepEqual(result, { action: "go_to_question", target_question_id: 3 });
  assert.equal(evaluateLogicRules({ current_question: questions[0], answer: true, questions, rules: [rule({})] }), null);
});

test("evaluation supports text and numeric operators", () => {
  assert.deepEqual(
    evaluateLogicRules({
      current_question: questions[1],
      answer: 19,
      questions,
      rules: [rule({ source_question_id: 2, operator: "greater_than", value: 18, target_question_id: 3 })],
    }),
    { action: "go_to_question", target_question_id: 3 },
  );
  assert.deepEqual(
    evaluateLogicRules({
      current_question: questions[2],
      answer: "Bring snacks",
      questions,
      rules: [rule({ source_question_id: 3, operator: "contains", value: "SNACK", action: "submit_form", target_question_id: null })],
    }),
    { action: "submit_form", target_question_id: null },
  );
});

test("next question resolution uses numeric question IDs", () => {
  assert.equal(getNextQuestionId(1, questions), 2);
  assert.equal(getNextQuestionId(3, questions), null);
});
