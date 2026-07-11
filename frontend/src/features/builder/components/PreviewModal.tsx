"use client";

import { useState } from "react";

import { evaluateLogicRules, getNextQuestionId } from "@/features/logic/rules";
import { getThemeButtonStyle, getThemePageStyle, getThemeSurfaceStyle } from "@/features/theme/themeStyles";
import { useAppearanceStore } from "@/stores/appearance.store";
import type { Form } from "@/types/form";
import type { ResponseAnswer } from "@/types/response";
import { Dialog } from "@/features/dashboard/components/Dialog";

import { QuestionRenderer } from "./QuestionRenderer";

type PreviewModalProps = {
  form: Form | null;
  open: boolean;
  onClose: () => void;
};

export function PreviewModal({ form, onClose, open }: PreviewModalProps) {
  const appearance = useAppearanceStore((state) => state.appearance);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Record<number, ResponseAnswer["value"]>>({});
  const [complete, setComplete] = useState(false);
  const questions = form?.questions ?? [];
  const orderedQuestions = questions.toSorted((a, b) => a.position - b.position);
  const questionId = currentQuestionId ?? orderedQuestions[0]?.id ?? null;
  const question = orderedQuestions.find((item) => item.id === questionId) ?? null;
  const index = question ? orderedQuestions.findIndex((item) => item.id === question.id) : 0;


  function setPreviewQuestion(question_id: number) {
    setCurrentQuestionId(question_id);
    setHistory((current) =>
      current[current.length - 1] === question_id ? current : [...current, question_id],
    );
  }

  function handleNext() {
    if (!question) {
      return;
    }

    setHistory((current) => (current.length === 0 ? [question.id] : current));

    const result = evaluateLogicRules({
      answer: answers[question.id],
      current_question: question,
      questions: orderedQuestions,
      rules: form?.logic_rules ?? [],
    });

    if (result?.action === "submit_form") {
      setComplete(true);
      return;
    }

    const nextQuestionId =
      result?.action === "go_to_question"
        ? result.target_question_id
        : getNextQuestionId(question.id, orderedQuestions);

    if (nextQuestionId === null) {
      setComplete(true);
      return;
    }

    setPreviewQuestion(nextQuestionId);
  }

  function handlePrevious() {
    setComplete(false);
    setHistory((current) => {
      if (current.length <= 1) {
        const firstQuestionId = orderedQuestions[0]?.id ?? null;
        setCurrentQuestionId(firstQuestionId);
        return firstQuestionId ? [firstQuestionId] : [];
      }

      const nextHistory = current.slice(0, -1);
      setCurrentQuestionId(nextHistory[nextHistory.length - 1] ?? null);
      return nextHistory;
    });
  }

  return (
    <Dialog
      open={open}
      title="Preview mode"
      description="This local preview does not submit responses."
      onClose={onClose}
    >
      <div
        className="mt-5 max-h-[70vh] overflow-y-auto rounded-lg p-4"
        style={form ? getThemePageStyle(form.theme, appearance) : undefined}
      >
        {complete ? (
          <div
            className="rounded-md border bg-white p-6 text-center"
            style={form ? getThemeSurfaceStyle(form.theme, appearance) : undefined}
          >
            <p className="text-xs font-semibold uppercase text-stone-500">Preview complete</p>
            <h3 className="mt-2 text-xl font-semibold text-stone-950">
              {form?.thank_you_title ?? "Thank you"}
            </h3>
            <p className="mt-2 text-sm text-stone-600">
              {form?.thank_you_message ?? "This preview did not save a response."}
            </p>
          </div>
        ) : question ? (
          <QuestionRenderer
            question={question}
            questionNumber={index + 1}
            theme={form?.theme}
            value={answers[question.id]}
            onAnswerChange={(value) =>
              setAnswers((current) => ({
                ...current,
                [question.id]: value,
              }))
            }
          />
        ) : (
          <p className="rounded-md bg-white p-6 text-center text-sm text-stone-600">
            Add questions to preview this form.
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          {orderedQuestions.length > 0 ? `${index + 1} of ${orderedQuestions.length}` : "No questions"}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-800 disabled:opacity-40"
            style={form ? getThemeButtonStyle(form.theme, false, appearance) : undefined}
            disabled={!complete && history.length <= 1 && index === 0}
            onClick={handlePrevious}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white disabled:bg-stone-400"
            style={form ? getThemeButtonStyle(form.theme, true, appearance) : undefined}
            disabled={!question && !complete}
            onClick={handleNext}
          >
            {index >= orderedQuestions.length - 1 ? "Finish preview" : "Next"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
