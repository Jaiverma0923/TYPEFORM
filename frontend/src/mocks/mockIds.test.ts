import assert from "node:assert/strict";
import test from "node:test";

import { createNumericId } from "./mockIds.ts";

test("createNumericId starts at 1 for empty collections", () => {
  assert.equal(createNumericId([]), 1);
});

test("createNumericId generates numeric IDs after the current maximum", () => {
  const nextId = createNumericId([1, 2, 9]);

  assert.equal(nextId, 10);
  assert.equal(typeof nextId, "number");
});
