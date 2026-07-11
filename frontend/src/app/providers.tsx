"use client";

import { Toaster } from "sonner";

import { useAppearanceStore } from "@/stores/appearance.store";

import { AppearanceInitializer } from "./AppearanceInitializer";

export function Providers() {
  const appearance = useAppearanceStore((state) => state.appearance);

  return (
    <>
      <AppearanceInitializer />
      <Toaster richColors closeButton theme={appearance} />
    </>
  );
}
