"use client";

import { useEffect, useId, useState } from "react";

import type { Form } from "@/types/form";

import { Dialog } from "./Dialog";

type FormDialogProps = {
  mode: "create" | "rename";
  open: boolean;
  form?: Form | null;
  pending: boolean;
  onClose: () => void;
  onSubmit: (title: string) => Promise<void>;
};

export function FormDialog({
  form,
  mode,
  onClose,
  onSubmit,
  open,
  pending,
}: FormDialogProps) {
  const inputId = useId();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle(mode === "rename" ? form?.title ?? "" : "");
      setError(null);
    }
  }, [form?.title, mode, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Enter a form title.");
      return;
    }

    await onSubmit(trimmedTitle);
  }

  return (
    <Dialog
      open={open}
      title={mode === "create" ? "Create form" : "Rename form"}
      description={
        mode === "create"
          ? "Name your new form before opening it in the builder."
          : "Update the title shown in your workspace."
      }
      onClose={pending ? () => undefined : onClose}
    >
      <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor={inputId} className="text-sm font-medium text-primary">
            Form title
          </label>
          <input
            id={inputId}
            data-testid="form-title-input"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setError(null);
            }}
            className="mt-2 w-full rounded border border-border bg-surface px-3 py-2 text-sm text-primary outline-none transition placeholder:text-secondary focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Untitled form"
            disabled={pending}
          />
          {error ? <p className="mt-2 text-sm text-destructive-text">{error}</p> : null}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded border border-border px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="submit"
            data-testid={mode === "create" ? "confirm-create-form" : "confirm-rename-form"}
            className="rounded bg-accent px-4 py-2 text-sm font-medium text-surface transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
          >
            {pending ? "Saving..." : mode === "create" ? "Create form" : "Save title"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
