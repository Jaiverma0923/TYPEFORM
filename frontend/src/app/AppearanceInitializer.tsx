"use client";

import { useEffect } from "react";

import { useAppearanceStore } from "@/stores/appearance.store";

export function AppearanceInitializer() {
  const initialize = useAppearanceStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
