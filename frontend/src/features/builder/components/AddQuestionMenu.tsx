"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import type { QuestionType } from "@/types/question";

import { questionTypeOptions } from "../utils/questionTypes";

type AddQuestionMenuProps = {
  pending: boolean;
  onAddQuestion: (type: QuestionType) => void;
};

export function AddQuestionMenu({ onAddQuestion, pending }: AddQuestionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-surface hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:opacity-50"
        disabled={pending}
        onClick={() => setOpen((current) => !current)}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add question
      </button>
      {open ? (
        <div className="absolute left-0 right-0 top-12 z-20 rounded-lg border border-border bg-surface p-2 shadow-lg">
          {questionTypeOptions.map(({ Icon, description, label, type }) => (
            <button
              key={type}
              type="button"
              className="flex w-full gap-3 rounded-md p-3 text-left hover:bg-page focus:bg-page focus:outline-none"
              onClick={() => {
                onAddQuestion(type);
                setOpen(false);
              }}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden="true" />
              <span>
                <span className="block text-sm font-medium text-primary">{label}</span>
                <span className="block text-xs text-secondary">{description}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
