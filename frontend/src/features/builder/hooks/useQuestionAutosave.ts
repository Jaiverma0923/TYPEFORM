"use client";

import { useEffect, useMemo, useRef } from "react";
import { z } from "zod";

import { updateQuestion as updateQuestionService } from "@/services/questions.api";
import { useBuilderStore } from "@/stores/builder.store";
import type { Question, UpdateQuestionPayload } from "@/types/question";

import { questionsAreEqual, sanitizeQuestionPayload } from "../utils/questionTypes";

const questionAutosaveSchema = z.object({
  type: z.enum([
    "short_text",
    "long_text",
    "multiple_choice",
    "dropdown",
    "email",
    "number",
    "yes_no",
    "rating",
  ]),
  title: z.string().trim().min(1, "Question title is required."),
  description: z.string().nullable().optional(),
  required: z.boolean(),
  settings: z.object({
    options: z.array(z.string().trim().min(1)).optional(),
    min: z.number().int().min(1).max(10).optional(),
    max: z.number().int().min(1).max(10).optional(),
    placeholder: z.string().optional(),
  }),
}).superRefine((value, context) => {
  if (value.type === "multiple_choice" || value.type === "dropdown") {
    const options = value.settings.options ?? [];
    const normalized = options.map((option) => option.trim().toLowerCase());

    if (options.length < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one option.",
        path: ["settings", "options"],
      });
    }

    if (new Set(normalized).size !== normalized.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options must be unique.",
        path: ["settings", "options"],
      });
    }
  }

  if (value.type === "rating") {
    const min = value.settings.min ?? 1;
    const max = value.settings.max ?? 5;

    if (min >= max) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum must be less than maximum.",
        path: ["settings", "min"],
      });
    }
  }
});

type UseQuestionAutosaveParams = {
  question: Question | null;
  values: UpdateQuestionPayload;
  valid: boolean;
};

export function useQuestionAutosave({
  question,
  valid,
  values,
}: UseQuestionAutosaveParams) {
  const updateQuestion = useBuilderStore((state) => state.updateQuestion);
  const setSaveStatus = useBuilderStore((state) => state.setSaveStatus);
  const lastPayloadRef = useRef<string>("");
  const savingRef = useRef(false);

  const payload = useMemo(() => {
    if (!question) {
      return null;
    }

    return sanitizeQuestionPayload(question, values);
  }, [question, values]);

  useEffect(() => {
    if (!question || !payload || !valid) {
      return;
    }

    const parsed = questionAutosaveSchema.safeParse(payload);

    if (!parsed.success || questionsAreEqual(question, payload)) {
      return;
    }

    const serialized = JSON.stringify(payload);

    if (serialized === lastPayloadRef.current || savingRef.current) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      savingRef.current = true;
      setSaveStatus("saving");

      try {
        const response = await updateQuestionService(question.id, payload);
        updateQuestion(response.data);
        lastPayloadRef.current = serialized;
        setSaveStatus("saved");
        window.setTimeout(() => setSaveStatus("idle"), 1300);
      } catch {
        setSaveStatus("error");
      } finally {
        savingRef.current = false;
      }
    }, 650);

    return () => window.clearTimeout(timeout);
  }, [payload, question, setSaveStatus, updateQuestion, valid]);
}
