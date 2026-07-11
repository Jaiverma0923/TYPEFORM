"use client";

import Link from "next/link";
import { AlertCircle, BarChart3, RefreshCw } from "lucide-react";

export function AnalyticsSkeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="h-5 w-32 rounded bg-border" />
      <div className="space-y-3">
        <div className="h-10 w-80 rounded bg-border" />
        <div className="h-4 w-52 rounded bg-border" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-surface p-5">
            <div className="h-4 w-24 rounded bg-border" />
            <div className="mt-5 h-8 w-20 rounded bg-border" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-surface p-5">
            <div className="h-5 w-1/2 rounded bg-border" />
            <div className="mt-5 h-24 rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-destructive-bg bg-destructive-bg/30 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive-bg">
        <AlertCircle className="h-6 w-6 text-destructive-text" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-xl font-medium text-destructive-text">
        Analytics could not be loaded
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-destructive-text/80">
        {message}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 rounded bg-destructive-btn px-4 py-2 text-sm font-medium text-surface transition hover:bg-destructive-btn-hover focus:outline-none focus:ring-2 focus:ring-destructive-btn focus:ring-offset-1"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Retry
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export function AnalyticsEmptyState({ builderHref }: { builderHref: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <BarChart3 className="h-6 w-6 text-secondary" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-medium text-primary">No analytics yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-secondary/80">
        Analytics will appear after this form receives responses. You can keep
        editing the form or share it with respondents.
      </p>
      <Link
        href={builderHref}
        className="mt-6 inline-flex rounded bg-accent px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
      >
        Open builder
      </Link>
    </div>
  );
}
