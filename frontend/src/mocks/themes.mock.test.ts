import assert from "node:assert/strict";
import test from "node:test";

import { publicMockApi } from "./public.mock.ts";
import { resetStoredFormsForTests } from "./forms.store.ts";
import { themesMockApi } from "./themes.mock.ts";
import { createThemeFromPreset } from "../features/theme/themePresets.ts";
import { getEffectiveTheme } from "../features/theme/themeStyles.ts";

test("theme mock updates are deep-copied and visible through the public form", async () => {
  resetStoredFormsForTests();

  const response = await themesMockApi.updateTheme(2, {
    colors: {
      primary: "#123456",
      background: "#abcdef",
    },
    buttons: {
      radius: 18,
    },
  });

  assert.equal(response.data.colors.primary, "#123456");
  assert.equal(response.data.colors.background, "#abcdef");
  assert.equal(response.data.buttons.radius, 18);

  response.data.colors.primary = "#000000";
  response.data.buttons.radius = 1;

  const publicForm = await publicMockApi.getPublicForm("event-registration");
  assert.equal(publicForm.data.theme.colors.primary, "#123456");
  assert.equal(publicForm.data.theme.buttons.radius, 18);
});

test("theme reset restores the Classic Typeform preset for the shared form", async () => {
  resetStoredFormsForTests();

  await themesMockApi.updateTheme(2, {
    colors: {
      primary: "#654321",
    },
    typography: {
      font_family: "Poppins",
    },
  });

  const response = await themesMockApi.resetTheme(2);

  assert.equal(response.data.name, "Classic Typeform");
  assert.equal(response.data.form_id, 2);
  assert.equal(response.data.colors.primary, "#191919");
  assert.equal(response.data.typography.font_family, "Inter");

  const publicForm = await publicMockApi.getPublicForm("event-registration");
  assert.equal(publicForm.data.theme.name, "Classic Typeform");
  assert.equal(publicForm.data.theme.colors.primary, "#191919");
});

test("theme mock rejects invalid colors without mutating stored theme", async () => {
  resetStoredFormsForTests();

  const before = await themesMockApi.getTheme(2);

  await assert.rejects(
    themesMockApi.updateTheme(2, {
      colors: {
        primary: "not-a-color",
      },
    }),
    /invalid color/i,
  );

  const after = await themesMockApi.getTheme(2);
  assert.equal(after.data.colors.primary, before.data.colors.primary);
});

test("getTheme returns a deep copy", async () => {
  resetStoredFormsForTests();

  const first = await themesMockApi.getTheme(2);
  first.data.colors.primary = "#000000";
  first.data.typography.font_family = "Poppins";

  const second = await themesMockApi.getTheme(2);
  assert.notEqual(second.data.colors.primary, "#000000");
  assert.notEqual(second.data.typography.font_family, "Poppins");
});

test("dark appearance keeps selected theme identity while adjusting semantic surfaces", () => {
  const warmTheme = createThemeFromPreset("Warm", 2, 2);
  const effectiveTheme = getEffectiveTheme(warmTheme, "dark");

  assert.equal(effectiveTheme.name, "Warm");
  assert.equal(effectiveTheme.typography.font_family, warmTheme.typography.font_family);
  assert.equal(effectiveTheme.buttons.radius, warmTheme.buttons.radius);
  assert.equal(effectiveTheme.inputs.radius, warmTheme.inputs.radius);
  assert.equal(effectiveTheme.colors.accent, warmTheme.colors.accent);
  assert.notEqual(effectiveTheme.colors.surface, warmTheme.colors.surface);
  assert.notEqual(effectiveTheme.colors.text, warmTheme.colors.text);
});
