"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import type { Question, QuestionType } from "@/types/question";

import { useQuestionAutosave } from "../hooks/useQuestionAutosave";
import { getDefaultSettings, questionTypeOptions } from "../utils/questionTypes";

const optionSchema = z.object({
  value: z.string().trim().min(1, "Option cannot be empty."),
});

const questionEditorSchema = z.object({
  title: z.string().trim().min(1, "Question title is required."),
  description: z.string(),
  required: z.boolean(),
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
  placeholder: z.string(),
  options: z.array(optionSchema),
  min: z.coerce.number().int().min(1, "Minimum must be at least 1.").max(10),
  max: z.coerce.number().int().min(1).max(10, "Maximum must be at most 10."),
}).superRefine((value, context) => {
  if (value.type === "multiple_choice" || value.type === "dropdown") {
    const normalized = value.options.map((option) => option.value.trim().toLowerCase());

    if (value.options.length < 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one option.",
        path: ["options"],
      });
    }

    if (new Set(normalized).size !== normalized.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Options must be unique.",
        path: ["options"],
      });
    }
  }

  if (value.type === "rating" && value.min >= value.max) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Minimum must be less than maximum.",
      path: ["min"],
    });
  }

});

type QuestionEditorValues = z.infer<typeof questionEditorSchema>;

type QuestionSettingsPanelProps = {
  question: Question | null;
};

function getDefaultValues(question: Question): QuestionEditorValues {
  return {
    title: question.title,
    description: question.description ?? "",
    required: question.required,
    type: question.type,
    placeholder: question.settings.placeholder ?? "",
    options: (question.settings.options ?? ["Option 1"]).map((value) => ({ value })),
    min: question.settings.min ?? 1,
    max: question.settings.max ?? 5,
  };
}

function toAutosaveValues(values: Partial<QuestionEditorValues>) {
  const description = (values.description ?? "").trim();
  const options = values.options ?? [];

  return {
    title: values.title ?? "",
    description: description ? description : null,
    required: values.required ?? false,
    type: values.type,
    settings:
      values.type === "multiple_choice" || values.type === "dropdown"
        ? { options: options.map((option) => option.value.trim()) }
        : values.type === "rating"
          ? { min: values.min, max: values.max }
            : values.type === "yes_no"
              ? {}
              : { placeholder: values.placeholder },
  };
}

export function QuestionSettingsPanel({ question }: QuestionSettingsPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const form = useForm<QuestionEditorValues>({
    mode: "onChange",
    values: question ? getDefaultValues(question) : undefined,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });
  const values = form.watch();
  const parsed = useMemo(() => questionEditorSchema.safeParse(values), [values]);

  useEffect(() => {
    if (question) {
      form.reset(getDefaultValues(question));
    }
  }, [form, question]);

  useQuestionAutosave({
    question,
    values: parsed.success ? toAutosaveValues(parsed.data) : toAutosaveValues(values),
    valid: parsed.success,
  });

  if (!question) {
    return (
      <aside className="border-l border-border bg-surface p-4">
        <p className="text-sm text-secondary">Select a question to edit its settings.</p>
      </aside>
    );
  }

  function handleTypeChange(type: QuestionType) {
    const defaults = getDefaultSettings(type);
    form.setValue("type", type, { shouldDirty: true, shouldValidate: true });
    form.setValue("placeholder", defaults.placeholder ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      "options",
      (defaults.options ?? ["Option 1"]).map((value) => ({ value })),
      { shouldDirty: true, shouldValidate: true },
    );
    form.setValue("min", defaults.min ?? 1, { shouldDirty: true, shouldValidate: true });
    form.setValue("max", defaults.max ?? 5, { shouldDirty: true, shouldValidate: true });
  }

  return (
    <aside className="h-full min-h-0 overflow-y-auto border-l border-border bg-surface">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <div className="border-b border-border px-4 py-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
              Question settings
            </p>
            <p className="mt-1 text-sm text-secondary">Changes autosave after a short pause.</p>
          </div>

          <section className="space-y-3 border-b border-border px-4 py-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-primary">Title</span>
              <input
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                {...form.register("title")}
                aria-invalid={Boolean(form.formState.errors.title)}
              />
              {form.formState.errors.title ? (
                <span className="text-xs text-red-700">
                  {form.formState.errors.title.message}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-primary">Description</span>
              <textarea
                className="min-h-20 rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                {...form.register("description")}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-primary">Type</span>
              <select
                className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                value={values.type}
                onChange={(event) => handleTypeChange(event.target.value as QuestionType)}
              >
                {questionTypeOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="text-sm font-medium text-primary">Required</span>
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                {...form.register("required")}
              />
            </label>
          </section>

          {["short_text", "long_text", "email", "number"].includes(values.type) ? (
            <section className="space-y-3 border-b border-border px-4 py-5">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-primary">Placeholder</span>
                <input
                  className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                  {...form.register("placeholder")}
                />
              </label>
            </section>
          ) : null}

          {values.type === "multiple_choice" || values.type === "dropdown" ? (
            <section className="space-y-3 border-b border-border px-4 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  Options
                </h3>
                <button
                  type="button"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => append({ value: `Option ${fields.length + 1}` })}
                >
                  Add option
                </button>
              </div>
              <div className="grid gap-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <input
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                      aria-label={`Option ${index + 1}`}
                      {...form.register(`options.${index}.value`)}
                    />
                    <button
                      type="button"
                      className="rounded-md border border-border px-3 py-2 text-sm text-secondary disabled:opacity-50"
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              {form.formState.errors.options?.message ? (
                <p className="text-xs text-red-700">{form.formState.errors.options.message}</p>
              ) : null}
            </section>
          ) : null}

          {values.type === "rating" ? (
            <section className="space-y-3 border-b border-border px-4 py-5">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-primary">Minimum</span>
                  <input
                    type="number"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                    {...form.register("min", { valueAsNumber: true })}
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-primary">Maximum</span>
                  <input
                    type="number"
                    className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
                    {...form.register("max", { valueAsNumber: true })}
                  />
                </label>
              </div>
              {form.formState.errors.min?.message ? (
                <p className="text-xs text-red-700">{form.formState.errors.min.message}</p>
              ) : null}
              <div className="flex flex-wrap gap-2 rounded-md border border-border bg-surface p-3">
                {Array.from(
                  { length: Math.max(0, (Number(values.max) || 0) - (Number(values.min) || 0) + 1) },
                  (_, index) => (Number(values.min) || 1) + index,
                ).map((value) => (
                  <span
                    key={value}
                    className="flex h-8 w-8 items-center justify-center rounded border border-border bg-surface text-xs text-primary"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}