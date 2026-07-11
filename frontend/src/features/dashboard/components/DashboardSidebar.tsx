"use client";

import { ChevronUp, Layers, Mic, Plus, Search, SendHorizontal } from "lucide-react";
import { useState } from "react";

type DashboardSidebarProps = {
  formsCount: number;
  responsesUsed: number;
  responsesLimit: number;
  searchQuery: string;
  onCreateForm: () => void;
  onSearchChange: (query: string) => void;
};

export function DashboardSidebar({
  formsCount,
  onCreateForm,
  onSearchChange,
  responsesLimit,
  responsesUsed,
  searchQuery,
}: DashboardSidebarProps) {
  const [privateOpen, setPrivateOpen] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const progress = responsesLimit > 0 ? Math.min(responsesUsed / responsesLimit, 1) * 100 : 0;

  return (
    <aside className="flex w-full shrink-0 flex-col border-r border-border bg-surface sm:w-64">
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-4">
        <button
          type="button"
          data-testid="create-form-button"
          onClick={onCreateForm}
          className="inline-flex w-full items-center justify-center gap-2 rounded bg-accent px-4 py-2.5 text-sm font-medium text-surface transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create form
        </button>

        <div className="relative">
          <label htmlFor="sidebar-search" className="sr-only">
            Search
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-secondary/60">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="sidebar-search"
            type="search"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded border border-border bg-page px-3 py-2 pl-9 text-sm text-primary outline-none transition placeholder:text-secondary/60 focus:border-border-hover focus:ring-1 focus:ring-accent"
          />
        </div>

        <div>
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium uppercase tracking-wide text-secondary/80">
              Workspaces
            </p>
            <button
              type="button"
              aria-label="Add workspace"
              className="flex h-6 w-6 items-center justify-center rounded text-secondary transition hover:bg-page hover:text-primary"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPrivateOpen((open) => !open)}
            className="mt-2 flex w-full items-center gap-1 px-1 py-1 text-sm font-medium text-primary"
          >
            <ChevronUp
              className={`h-3.5 w-3.5 text-secondary transition-transform ${
                privateOpen ? "" : "rotate-180"
              }`}
              aria-hidden="true"
            />
            Private
          </button>

          {privateOpen ? (
            <div className="mt-1 flex items-center justify-between rounded bg-page px-3 py-2 text-sm">
              <span className="flex items-center gap-2 text-primary">
                <Layers className="h-4 w-4 text-secondary" aria-hidden="true" />
                My workspace
              </span>
              <span className="text-xs text-secondary">{formsCount}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <p className="text-sm text-secondary">Responses collected</p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-page">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-secondary">
            {responsesUsed} / {responsesLimit}
          </p>
          <button
            type="button"
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm font-medium text-primary transition hover:bg-page"
          >
            Increase response limit
          </button>
        </div>
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-page px-3 py-2">
          <Mic className="h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
          <input
            type="text"
            placeholder="Ask Typeform AI"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="h-6 w-full bg-transparent text-sm text-primary outline-none placeholder:text-secondary/60"
          />
          <button
            type="button"
            aria-label="Send"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-secondary/60 transition hover:text-primary"
          >
            <SendHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
