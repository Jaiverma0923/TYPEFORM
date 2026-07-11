import assert from "node:assert/strict";
import test from "node:test";

import {
  buildResponseAnswers,
  getCompletedQuestionCount,
  validateAnswer,
} from "./answers.ts";
import type { Question } from "@/types/question";

const baseQuestion: Question = {
  id: 1,
  form_id: 1,
  type: "short_text",
  title: "Name",
  description: null,
  required: true,
  position: 1,
  settings: {},
  version: 1,
  created_at: "2026-07-10T00:00:00.000Z",
  updated_at: "2026-07-10T00:00:00.000Z",
};

test("validateAnswer blocks empty required answers", () => {
  assert.equal(validateAnswer(baseQuestion, ""), "This question is required.");
});

test("validateAnswer validates email format", () => {
  assert.equal(validateAnswer({ ...baseQuestion, type: "email" }, "bad"), "Enter a valid email address.");
  assert.equal(validateAnswer({ ...baseQuestion, type: "email" }, "a@example.com"), null);
});

test("validateAnswer validates option membership and rating range", () => {
  assert.equal(
    validateAnswer(
      { ...baseQuestion, type: "dropdown", settings: { options: ["A"] } },
      "B",
    ),
    "Choose one of the available options.",
  );
  assert.equal(validateAnswer({ ...baseQuestion, type: "rating", settings: { min: 1, max: 5 } }, 6), "Choose a rating between 1 and 5.");
});

test("buildResponseAnswers preserves numeric question IDs", () => {
  const answers = buildResponseAnswers([{ ...baseQuestion, id: 12 }], { 12: "  Hello  " });

  assert.deepEqual(answers, [{ question_id: 12, value: "Hello" }]);
});

test("getCompletedQuestionCount counts non-empty answers", () => {
  assert.equal(getCompletedQuestionCount([{ ...baseQuestion, id: 1 }, { ...baseQuestion, id: 2 }], { 1: "Yes" }), 1);
});
