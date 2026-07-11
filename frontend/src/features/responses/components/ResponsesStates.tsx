"use client";

import Link from "next/link";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";

export function ResponsesSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      <div className="h-5 w-32 rounded bg-border" />
      <div className="space-y-3">
        <div className="h-10 w-72 rounded bg-border" />
        <div className="h-4 w-48 rounded bg-border" />
      </div>
      <div className="rounded-lg border border-border bg-surface">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-border p-5 last:border-b-0"
          >
            <div className="h-5 w-40 rounded bg-border" />
            <div className="mt-4 h-4 w-2/3 rounded bg-border" />
            <div className="mt-2 h-4 w-1/2 rounded bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResponsesErrorState({
  backHref,
  message,
  onRetry,
  title,
}: {
  backHref: string;
  message: string;
  onRetry: () => void;
  title: string;
}) {
  return (
    <div className="rounded-lg border border-destructive-bg bg-destructive-bg/30 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive-bg">
        <AlertCircle className="h-6 w-6 text-destructive-text" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-xl font-medium text-destructive-text">{title}</h1>
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
          href={backHref}
          className="inline-flex items-center justify-center rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
        >
          Back
        </Link>
      </div>
    </div>
  );
}

export function ResponsesEmptyState({
  builderHref,
}: {
  builderHref: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-page">
        <Inbox className="h-6 w-6 text-secondary" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-medium text-primary">No responses yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-secondary/80">
        Share the published form to start collecting responses. New mock
        submissions will appear here during this browser session.
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
