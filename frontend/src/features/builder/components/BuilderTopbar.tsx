"use client";

import Link from "next/link";
import { BarChart3, Check, Copy, Eye, Inbox, Loader2, Send, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AppearanceToggle } from "@/components/AppearanceToggle";
import { getAnalyticsRoute } from "@/features/analytics/utils/routes";
import { getResponsesRoute } from "@/features/responses/utils/routes";
import type { SaveStatus } from "@/stores/builder.store";
import type { Form } from "@/types/form";

type BuilderTopbarProps = {
  form: Form;
  pendingPublish: boolean;
  saveStatus: SaveStatus;
  onCopyPublicLink: () => void;
  onPreview: () => void;
  onSaveTitle: (title: string) => void;
  onTogglePublish: () => void;
};

export function BuilderTopbar({
  form,
  onCopyPublicLink,
  onPreview,
  onSaveTitle,
  onTogglePublish,
  pendingPublish,
  saveStatus,
}: BuilderTopbarProps) {
  const [title, setTitle] = useState(form.title);
  const [editing, setEditing] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const analyticsRoute = getAnalyticsRoute(form.id);
  const responsesRoute = getResponsesRoute(form.id);

  useEffect(() => setTitle(form.title), [form.title]);

  function commitTitle() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required.");
      return;
    }

    setTitleError(null);
    setEditing(false);
    onSaveTitle(trimmedTitle);
  }

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
        >
          Back
        </Link>
        <div className="min-w-0">
          {editing ? (
            <label className="block">
              <span className="sr-only">Form title</span>
              <input
                className="w-full max-w-sm rounded-md border border-border bg-surface px-2 py-1 text-lg font-semibold text-primary outline-none focus:border-accent focus:ring-2 focus:ring-focus-ring"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setTitleError(null);
                }}
                onBlur={commitTitle}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    commitTitle();
                  }

                  if (event.key === "Escape") {
                    setTitle(form.title);
                    setEditing(false);
                    setTitleError(null);
                  }
                }}
                autoFocus
              />
            </label>
          ) : (
            <button
              type="button"
              className="block max-w-sm truncate text-left text-lg font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
              onClick={() => setEditing(true)}
            >
              {form.title}
            </button>
          )}
          <div className="mt-1 flex items-center gap-2 text-xs text-secondary">
            <span>{form.status === "published" ? "Published" : "Draft"}</span>
            <span aria-hidden="true">/</span>
            <span className="inline-flex items-center gap-1">
              {saveStatus === "saving" ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
              {saveStatus === "saved" ? <Check className="h-3 w-3" /> : null}
              {saveStatus === "saving"
                ? "Saving..."
                : saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "error"
                    ? "Couldn't save"
                    : "Ready"}
            </span>
          </div>
          {titleError ? <p className="mt-1 text-xs text-red-700">{titleError}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AppearanceToggle />
        {responsesRoute ? (
          <Link
            href={responsesRoute}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
          >
            <Inbox className="h-4 w-4" aria-hidden="true" />
            Responses
          </Link>
        ) : null}
        {analyticsRoute ? (
          <Link
            href={analyticsRoute}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
          >
            <BarChart3 className="h-4 w-4" aria-hidden="true" />
            Analytics
          </Link>
        ) : null}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
          onClick={onPreview}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Preview
        </button>
        {form.status === "published" && form.slug ? (
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-primary hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
            onClick={onCopyPublicLink}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy link
          </button>
        ) : null}
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-surface hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:opacity-50"
          disabled={pendingPublish}
          onClick={onTogglePublish}
        >
          {form.status === "published" ? (
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          {form.status === "published" ? "Unpublish" : "Publish"}
        </button>
      </div>
    </header>
  );
}
