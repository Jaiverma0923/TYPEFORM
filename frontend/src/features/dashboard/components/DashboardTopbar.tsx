"use client";

import { Plus } from "lucide-react";

import { AppearanceToggle } from "@/components/AppearanceToggle";

type DashboardTopbarProps = {
  onCreateForm: () => void;
};

export function DashboardTopbar({ onCreateForm }: DashboardTopbarProps) {
  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-accent text-sm font-semibold text-surface">
            F
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <p className="truncate text-[15px] font-semibold text-primary">Formcraft</p>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
            <p className="hidden text-sm text-secondary sm:block">Workspace</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <AppearanceToggle />
          <div
            aria-label="User avatar"
            className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#e8e4db] text-sm font-medium text-primary sm:flex"
          >
            R
          </div>
          <button
            type="button"
            data-testid="create-form-button"
            className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
            onClick={onCreateForm}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Create form</span>
          </button>
        </div>
      </div>
    </header>
  );
}
