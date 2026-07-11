"use client";

import { Moon, Sun } from "lucide-react";

import { useAppearanceStore } from "@/stores/appearance.store";

export function AppearanceToggle() {
  const appearance = useAppearanceStore((state) => state.appearance);
  const toggle = useAppearanceStore((state) => state.toggle);
  const isDark = appearance === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-primary transition-colors duration-200 hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
      onClick={toggle}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
