import assert from "node:assert/strict";
import test from "node:test";

import { parsePositiveIntegerId } from "./routeParams.ts";

test("parsePositiveIntegerId accepts valid positive integer strings", () => {
  assert.equal(parsePositiveIntegerId("1"), 1);
  assert.equal(parsePositiveIntegerId("42"), 42);
});

test("parsePositiveIntegerId rejects invalid form ids", () => {
  assert.equal(parsePositiveIntegerId("form_1"), null);
  assert.equal(parsePositiveIntegerId("1.5"), null);
  assert.equal(parsePositiveIntegerId("0"), null);
  assert.equal(parsePositiveIntegerId("-1"), null);
  assert.equal(parsePositiveIntegerId("Infinity"), null);
});
