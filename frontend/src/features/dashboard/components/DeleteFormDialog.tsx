"use client";

import type { Form } from "@/types/form";

import { Dialog } from "./Dialog";

type DeleteFormDialogProps = {
  open: boolean;
  form: Form | null;
  pending: boolean;
  onClose: () => void;
  onDelete: (form_id: number) => Promise<void>;
};

export function DeleteFormDialog({
  form,
  onClose,
  onDelete,
  open,
  pending,
}: DeleteFormDialogProps) {
  return (
    <Dialog
      open={open}
      title="Delete form"
      description={
        form
          ? `Delete "${form.title}" permanently from this workspace.`
          : "Delete this form permanently from this workspace."
      }
      onClose={pending ? () => undefined : onClose}
    >
      <div className="mt-5 rounded border border-destructive-bg bg-destructive-bg/30 px-3 py-3 text-sm text-destructive-text">
        This action cannot be undone.
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded border border-border px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring"
          onClick={onClose}
          disabled={pending}
        >
          Cancel
        </button>
        <button
          type="button"
          data-testid="confirm-delete-form"
          className="rounded bg-destructive-btn px-4 py-2 text-sm font-medium text-surface transition hover:bg-destructive-btn-hover focus:outline-none focus:ring-2 focus:ring-destructive-btn focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pending || !form}
          onClick={() => {
            if (form) {
              void onDelete(form.id);
            }
          }}
        >
          {pending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Dialog>
  );
}
