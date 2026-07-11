import { create } from "zustand";

import type { Appearance } from "@/types/theme";

export const APPEARANCE_STORAGE_KEY = "typeform_clone_appearance";

type AppearanceState = {
  appearance: Appearance;
  hasExplicitPreference: boolean;
  initialized: boolean;
  initialize: () => void;
  setAppearance: (appearance: Appearance) => void;
  toggle: () => void;
};

export function isAppearance(value: string | null): value is Appearance {
  return value === "light" || value === "dark";
}

export function resolveInitialAppearance(stored: string | null, system: Appearance): {
  appearance: Appearance;
  hasExplicitPreference: boolean;
} {
  if (isAppearance(stored)) {
    return {
      appearance: stored,
      hasExplicitPreference: true,
    };
  }

  return {
    appearance: system,
    hasExplicitPreference: false,
  };
}

export function getSystemAppearance() {
  if (typeof window === "undefined") {
    return "light" satisfies Appearance;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyAppearance(appearance: Appearance) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.appearance = appearance;
  document.documentElement.style.colorScheme = appearance;
}

function getStoredAppearance() {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
  return isAppearance(stored) ? stored : null;
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  appearance: "light",
  hasExplicitPreference: false,
  initialized: false,
  initialize: () => {
    if (typeof window === "undefined") {
      return;
    }

    if (get().initialized) {
      return;
    }

    const stored = getStoredAppearance();
    const { appearance, hasExplicitPreference } = resolveInitialAppearance(
      stored,
      getSystemAppearance(),
    );
    applyAppearance(appearance);
    set({
      appearance,
      hasExplicitPreference,
      initialized: true,
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (get().hasExplicitPreference) {
        return;
      }

      const nextAppearance = event.matches ? "dark" : "light";
      applyAppearance(nextAppearance);
      set({ appearance: nextAppearance });
    };

    media.addEventListener("change", handleChange);
  },
  setAppearance: (appearance) => {
    applyAppearance(appearance);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
    }
    set({ appearance, hasExplicitPreference: true, initialized: true });
  },
  toggle: () => {
    const nextAppearance = get().appearance === "dark" ? "light" : "dark";
    get().setAppearance(nextAppearance);
  },
}));
