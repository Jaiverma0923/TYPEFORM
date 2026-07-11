import type { ApiResponse } from "@/types/common";
import type { FormTheme, UpdateThemePayload } from "@/types/theme";

import { createThemeFromPreset, isValidCssColor } from "../features/theme/themePresets.ts";
import { cloneTheme, findStoredForm, replaceStoredForm } from "./forms.store.ts";
import { mockResponse, shouldFailMock } from "./helpers.ts";

function failIfRequested(operation: string) {
  if (shouldFailMock(operation)) {
    throw new Error("Mock request failed.");
  }
}

function validateTheme(theme: FormTheme) {
  for (const color of Object.values(theme.colors)) {
    if (!isValidCssColor(color)) {
      throw new Error("Theme contains an invalid color.");
    }
  }

  if (theme.buttons.radius < 0 || theme.buttons.radius > 24) {
    throw new Error("Button radius must be between 0 and 24.");
  }

  if (theme.inputs.radius < 0 || theme.inputs.radius > 24) {
    throw new Error("Input radius must be between 0 and 24.");
  }
}

export const themesMockApi = {
  async getTheme(form_id: number): Promise<ApiResponse<FormTheme>> {
    failIfRequested("getTheme");
    return mockResponse("Theme fetched.", cloneTheme(findStoredForm(form_id).theme));
  },

  async updateTheme(form_id: number, payload: UpdateThemePayload): Promise<ApiResponse<FormTheme>> {
    failIfRequested("updateTheme");
    const now = new Date().toISOString();
    let updatedTheme = cloneTheme(findStoredForm(form_id).theme);

    updatedTheme = {
      ...updatedTheme,
      ...payload,
      colors: { ...updatedTheme.colors, ...payload.colors },
      typography: { ...updatedTheme.typography, ...payload.typography },
      background: { ...updatedTheme.background, ...payload.background },
      buttons: { ...updatedTheme.buttons, ...payload.buttons },
      inputs: { ...updatedTheme.inputs, ...payload.inputs },
      updated_at: now,
    };
    validateTheme(updatedTheme);

    replaceStoredForm(form_id, (form) => ({
      ...form,
      theme: cloneTheme(updatedTheme),
      updated_at: now,
      version: form.version + 1,
    }));

    return mockResponse("Theme updated.", cloneTheme(updatedTheme));
  },

  async resetTheme(form_id: number): Promise<ApiResponse<FormTheme>> {
    failIfRequested("resetTheme");
    const form = findStoredForm(form_id);
    const now = new Date().toISOString();
    const theme = {
      ...createThemeFromPreset("Classic Typeform", form_id, form.theme.id),
      created_at: form.theme.created_at,
      updated_at: now,
    };

    replaceStoredForm(form_id, (item) => ({
      ...item,
      theme: cloneTheme(theme),
      updated_at: now,
      version: item.version + 1,
    }));

    return mockResponse("Theme reset.", cloneTheme(theme));
  },
};
