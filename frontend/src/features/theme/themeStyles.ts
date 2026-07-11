import type { CSSProperties } from "react";

import type { Appearance, FormTheme } from "@/types/theme";

import { getFontFamilyValue, getThemeBackground } from "./themePresets.ts";

export function getEffectiveTheme(theme: FormTheme, appearance: Appearance) {
  if (appearance === "light") {
    return theme;
  }

  return {
    ...theme,
    colors: {
      ...theme.colors,
      background: "#101014",
      surface: "#18181b",
      text: "#f8fafc",
      border: "#3f3f46",
      primary: theme.colors.accent,
    },
    background: {
      ...theme.background,
      type: "solid" as const,
      value: "#101014",
    },
  };
}

export function getThemePageStyle(theme: FormTheme, appearance: Appearance = "light"): CSSProperties {
  const effectiveTheme = getEffectiveTheme(theme, appearance);

  return {
    background: getThemeBackground(effectiveTheme),
    color: effectiveTheme.colors.text,
    fontFamily: getFontFamilyValue(effectiveTheme.typography.font_family),
  };
}

export function getThemeSurfaceStyle(theme: FormTheme, appearance: Appearance = "light"): CSSProperties {
  const effectiveTheme = getEffectiveTheme(theme, appearance);

  return {
    backgroundColor: effectiveTheme.colors.surface,
    borderColor: effectiveTheme.colors.border,
    color: effectiveTheme.colors.text,
    fontFamily: getFontFamilyValue(effectiveTheme.typography.font_family),
  };
}

export function getThemeInputStyle(theme: FormTheme, appearance: Appearance = "light"): CSSProperties {
  const effectiveTheme = getEffectiveTheme(theme, appearance);

  return {
    backgroundColor: effectiveTheme.colors.surface,
    borderColor: effectiveTheme.colors.border,
    borderRadius: effectiveTheme.inputs.radius,
    color: effectiveTheme.colors.text,
  };
}

export function getThemeButtonStyle(
  theme: FormTheme,
  active = false,
  appearance: Appearance = "light",
): CSSProperties {
  const effectiveTheme = getEffectiveTheme(theme, appearance);
  const filled = effectiveTheme.buttons.style === "filled";

  if (active || filled) {
    return {
      backgroundColor: effectiveTheme.colors.primary,
      borderColor: effectiveTheme.colors.primary,
      borderRadius: effectiveTheme.buttons.radius,
      color: appearance === "dark" ? "#101014" : effectiveTheme.colors.surface,
    };
  }

  return {
    backgroundColor: effectiveTheme.colors.surface,
    borderColor: effectiveTheme.colors.primary,
    borderRadius: effectiveTheme.buttons.radius,
    color: effectiveTheme.colors.primary,
  };
}

export function getThemeMutedTextStyle(theme: FormTheme, appearance: Appearance = "light"): CSSProperties {
  const effectiveTheme = getEffectiveTheme(theme, appearance);

  return {
    color: effectiveTheme.colors.accent,
  };
}
