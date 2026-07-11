import assert from "node:assert/strict";
import test from "node:test";

import { getAnalyticsRoute } from "./routes.ts";

test("getAnalyticsRoute creates numeric analytics routes", () => {
  assert.equal(getAnalyticsRoute(2), "/forms/2/analytics");
});

test("getAnalyticsRoute rejects invalid IDs", () => {
  assert.equal(getAnalyticsRoute(0), null);
  assert.equal(getAnalyticsRoute(-1), null);
  assert.equal(getAnalyticsRoute(1.5), null);
  assert.equal(getAnalyticsRoute(Number.POSITIVE_INFINITY), null);
});
