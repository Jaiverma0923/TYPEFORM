import assert from "node:assert/strict";
import test from "node:test";

import { getResponseDetailRoute, getResponsesRoute } from "./routes.ts";

test("getResponsesRoute creates numeric form response routes", () => {
  assert.equal(getResponsesRoute(2), "/forms/2/responses");
});

test("getResponsesRoute rejects invalid IDs", () => {
  assert.equal(getResponsesRoute(0), null);
  assert.equal(getResponsesRoute(-1), null);
  assert.equal(getResponsesRoute(1.5), null);
  assert.equal(getResponsesRoute(Number.POSITIVE_INFINITY), null);
});

test("getResponseDetailRoute creates numeric response detail routes", () => {
  assert.equal(getResponseDetailRoute(2, 7), "/forms/2/responses/7");
});

test("getResponseDetailRoute rejects invalid IDs", () => {
  assert.equal(getResponseDetailRoute(2, 0), null);
  assert.equal(getResponseDetailRoute(0, 7), null);
});
