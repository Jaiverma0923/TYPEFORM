import type { FormTheme, ThemeFontFamily } from "@/types/theme";

const now = "2026-07-10T00:00:00.000Z";

export const themePresets = [
  "Classic Typeform",
  "Minimal",
  "Modern Blue",
  "Warm",
  "Dark-ready placeholder",
] as const;

export type ThemePresetName = (typeof themePresets)[number];

const presetSeeds: Record<ThemePresetName, Omit<FormTheme, "id" | "form_id" | "created_at" | "updated_at">> = {
  "Classic Typeform": {
    name: "Classic Typeform",
    colors: {
      primary: "#191919",
      background: "#fbfaf7",
      surface: "#ffffff",
      text: "#191919",
      border: "#dedbd2",
      accent: "#191919",
    },
    typography: {
      font_family: "Inter",
      heading_weight: 600,
      body_weight: 400,
    },
    background: {
      type: "solid",
      value: "#fbfaf7",
    },
    buttons: {
      radius: 6,
      style: "filled",
    },
    inputs: {
      radius: 6,
    },
  },
  Minimal: {
    name: "Minimal",
    colors: {
      primary: "#111827",
      background: "#ffffff",
      surface: "#ffffff",
      text: "#111827",
      border: "#e5e7eb",
      accent: "#4b5563",
    },
    typography: {
      font_family: "System",
      heading_weight: 500,
      body_weight: 400,
    },
    background: {
      type: "solid",
      value: "#ffffff",
    },
    buttons: {
      radius: 4,
      style: "outline",
    },
    inputs: {
      radius: 4,
    },
  },
  "Modern Blue": {
    name: "Modern Blue",
    colors: {
      primary: "#1d4ed8",
      background: "#eff6ff",
      surface: "#ffffff",
      text: "#172554",
      border: "#bfdbfe",
      accent: "#2563eb",
    },
    typography: {
      font_family: "Manrope",
      heading_weight: 700,
      body_weight: 400,
    },
    background: {
      type: "gradient",
      value: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    },
    buttons: {
      radius: 10,
      style: "filled",
    },
    inputs: {
      radius: 10,
    },
  },
  Warm: {
    name: "Warm",
    colors: {
      primary: "#9a3412",
      background: "#fff7ed",
      surface: "#ffffff",
      text: "#431407",
      border: "#fed7aa",
      accent: "#ea580c",
    },
    typography: {
      font_family: "DM Sans",
      heading_weight: 700,
      body_weight: 400,
    },
    background: {
      type: "solid",
      value: "#fff7ed",
    },
    buttons: {
      radius: 14,
      style: "filled",
    },
    inputs: {
      radius: 12,
    },
  },
  "Dark-ready placeholder": {
    name: "Dark-ready placeholder",
    colors: {
      primary: "#f8fafc",
      background: "#111827",
      surface: "#1f2937",
      text: "#f8fafc",
      border: "#374151",
      accent: "#93c5fd",
    },
    typography: {
      font_family: "Poppins",
      heading_weight: 600,
      body_weight: 400,
    },
    background: {
      type: "solid",
      value: "#111827",
    },
    buttons: {
      radius: 8,
      style: "filled",
    },
    inputs: {
      radius: 8,
    },
  },
};

export function createThemeFromPreset(
  preset: ThemePresetName,
  form_id: number,
  id = form_id,
): FormTheme {
  return {
    id,
    form_id,
    ...presetSeeds[preset],
    created_at: now,
    updated_at: now,
  };
}

export function getFontFamilyValue(font: ThemeFontFamily) {
  if (font === "System") {
    return "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  }

  return `${font}, ui-sans-serif, system-ui, sans-serif`;
}

export function getThemeBackground(theme: FormTheme) {
  return theme.background.type === "gradient" ? theme.background.value : theme.colors.background;
}

export function isValidCssColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}
