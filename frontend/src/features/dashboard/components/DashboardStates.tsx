"use client";

import { AlertCircle, FileText, Plus } from "lucide-react";

type DashboardEmptyStateProps = {
  type: "no_forms" | "no_results";
  onCreateForm: () => void;
  onClearFilters: () => void;
};

export function DashboardEmptyState({
  onClearFilters,
  onCreateForm,
  type,
}: DashboardEmptyStateProps) {
  if (type === "no_forms") {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-surface p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <FileText className="h-6 w-6 text-accent" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-medium text-primary">No forms yet</h2>
        <p className="mt-2 max-w-sm text-sm text-secondary/80">
          Create your first form to start collecting responses. It only takes a
          minute to get started.
        </p>
        <button
          type="button"
          onClick={onCreateForm}
          className="mt-6 inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create your first form
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-border bg-surface p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <SearchIcon className="h-6 w-6 text-secondary" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-medium text-primary">No results found</h2>
      <p className="mt-2 max-w-sm text-sm text-secondary/80">
        We couldn&apos;t find any forms matching your search or filter criteria.
      </p>
      <button
        type="button"
        onClick={onClearFilters}
        className="mt-6 inline-flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
      >
        Clear filters
      </button>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="flex items-end justify-between">
        <div className="h-10 w-48 rounded bg-border" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-64 rounded bg-border" />
        <div className="flex gap-4">
          <div className="h-10 w-64 rounded bg-border" />
          <div className="h-10 w-32 rounded bg-border" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-surface p-3">
            <div className="aspect-[6/5] rounded bg-border" />
            <div className="mt-4 space-y-3">
              <div className="h-5 w-2/3 rounded bg-border" />
              <div className="h-4 w-1/2 rounded bg-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive-bg bg-destructive-bg/30 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive-bg">
        <AlertCircle className="h-6 w-6 text-destructive-text" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-medium text-destructive-text">
        Failed to load forms
      </h2>
      <p className="mt-2 max-w-sm text-sm text-destructive-text/80">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded bg-destructive-btn px-4 py-2 text-sm font-medium text-surface transition hover:bg-destructive-btn-hover focus:outline-none focus:ring-2 focus:ring-destructive-btn focus:ring-offset-1"
      >
        Try again
      </button>
    </div>
  );
}
