import assert from "node:assert/strict";
import test from "node:test";

import { normalizeQuestionPositions } from "./questionOrder.ts";

test("normalizeQuestionPositions preserves numeric IDs and normalizes positions", () => {
  const reordered = normalizeQuestionPositions([
    { id: 14, position: 4 },
    { id: 10, position: 1 },
    { id: 12, position: 3 },
  ]);

  assert.deepEqual(
    reordered.map((question) => question.id),
    [14, 10, 12],
  );
  assert.deepEqual(
    reordered.map((question) => question.position),
    [1, 2, 3],
  );
  assert.equal(typeof reordered[0].id, "number");
});
