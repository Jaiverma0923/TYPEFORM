import assert from "node:assert/strict";
import test from "node:test";

import {
  APPEARANCE_STORAGE_KEY,
  isAppearance,
  resolveInitialAppearance,
} from "./appearance.store.ts";

test("appearance storage key is stable", () => {
  assert.equal(APPEARANCE_STORAGE_KEY, "typeform_clone_appearance");
});

test("isAppearance accepts only supported appearance values", () => {
  assert.equal(isAppearance("light"), true);
  assert.equal(isAppearance("dark"), true);
  assert.equal(isAppearance("system"), false);
  assert.equal(isAppearance(null), false);
});

test("resolveInitialAppearance restores explicit stored preference", () => {
  assert.deepEqual(resolveInitialAppearance("dark", "light"), {
    appearance: "dark",
    hasExplicitPreference: true,
  });
});

test("resolveInitialAppearance falls back to system preference", () => {
  assert.deepEqual(resolveInitialAppearance(null, "dark"), {
    appearance: "dark",
    hasExplicitPreference: false,
  });

  assert.deepEqual(resolveInitialAppearance("invalid", "light"), {
    appearance: "light",
    hasExplicitPreference: false,
  });
});
