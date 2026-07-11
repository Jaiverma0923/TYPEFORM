import assert from "node:assert/strict";
import test from "node:test";

import { formatAnswerValue, formatCompletionTime } from "./format.ts";

test("formatAnswerValue renders supported answer values", () => {
  assert.equal(formatAnswerValue(null), "No answer");
  assert.equal(formatAnswerValue("   "), "No answer");
  assert.equal(formatAnswerValue("Raghav"), "Raghav");
  assert.equal(formatAnswerValue(5), "5");
  assert.equal(formatAnswerValue(true), "Yes");
  assert.equal(formatAnswerValue(false), "No");
  assert.equal(formatAnswerValue(["A", "B"]), "A, B");
});

test("formatCompletionTime renders missing and elapsed times", () => {
  assert.equal(formatCompletionTime(null), "Not recorded");
  assert.equal(formatCompletionTime(45), "45s");
  assert.equal(formatCompletionTime(120), "2m");
  assert.equal(formatCompletionTime(135), "2m 15s");
});
