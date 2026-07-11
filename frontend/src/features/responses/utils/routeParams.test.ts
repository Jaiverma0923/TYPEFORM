import assert from "node:assert/strict";
import test from "node:test";

import { parsePositiveIntegerId } from "../../builder/utils/routeParams.ts";

test("responses routes accept numeric form and response IDs", () => {
  assert.equal(parsePositiveIntegerId("2"), 2);
  assert.equal(parsePositiveIntegerId("15"), 15);
});

test("responses routes reject prefixed IDs", () => {
  assert.equal(parsePositiveIntegerId("form_1"), null);
  assert.equal(parsePositiveIntegerId("response_1"), null);
});
