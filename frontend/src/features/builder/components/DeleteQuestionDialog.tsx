"use client";

import type { Question } from "@/types/question";
import { Dialog } from "@/features/dashboard/components/Dialog";

type DeleteQuestionDialogProps = {
  question: Question | null;
  pending: boolean;
  onClose: () => void;
  onDelete: () => void;
};

export function DeleteQuestionDialog({
  onClose,
  onDelete,
  pending,
  question,
}: DeleteQuestionDialogProps) {
  return (
    <Dialog
      open={Boolean(question)}
      title="Delete question"
      description={
        question
          ? `Delete "${question.title}" from this form.`
          : "Delete this question from the form."
      }
      onClose={pending ? () => undefined : onClose}
    >
      <p className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        This removes the question permanently from the form.
      </p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
          disabled={pending}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:bg-red-300"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting..." : "Delete"}
        </button>
      </div>
    </Dialog>
  );
}
