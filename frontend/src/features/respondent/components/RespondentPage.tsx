"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

import { Dialog } from "@/features/dashboard/components/Dialog";
import { QuestionRenderer } from "@/features/builder/components/QuestionRenderer";
import { getThemeButtonStyle, getThemePageStyle } from "@/features/theme/themeStyles";
import { useAppearanceStore } from "@/stores/appearance.store";
import { AppearanceToggle } from "@/components/AppearanceToggle";

import { useRespondentFlow } from "../hooks/useRespondentFlow";
import { RespondentNavigation } from "./RespondentNavigation";
import { RespondentProgress } from "./RespondentProgress";
import {
  RespondentEmptyState,
  RespondentErrorState,
  RespondentSkeleton,
} from "./RespondentStates";
import { ThankYouScreen } from "./ThankYouScreen";

type RespondentPageProps = {
  slug: string;
};

function shouldIgnoreKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName);
}

function isTextareaTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && target.tagName === "TEXTAREA";
}

export function RespondentPage({ slug }: RespondentPageProps) {
  const flow = useRespondentFlow(slug);
  const shouldReduceMotion = useReducedMotion();
  const appearance = useAppearanceStore((state) => state.appearance);
  const questionRegionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    questionRegionRef.current
      ?.querySelector<HTMLElement>("input, textarea, select, button")
      ?.focus();
  }, [flow.currentQuestion?.id]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (flow.loading || flow.submitted || flow.submitting || flow.resumeDraft) {
        return;
      }

      if (event.key === "Enter" && event.shiftKey) {
        event.preventDefault();
        flow.goPrevious();
        return;
      }

      if (event.key === "Enter" && !isTextareaTarget(event.target)) {
        event.preventDefault();
        flow.goForwardOrSubmit();
        return;
      }

      if (
        (event.key === "ArrowDown" || event.key === "ArrowRight") &&
        !shouldIgnoreKeyboardTarget(event.target)
      ) {
        event.preventDefault();
        flow.goForwardOrSubmit();
      }

      if (
        (event.key === "ArrowUp" || event.key === "ArrowLeft") &&
        !shouldIgnoreKeyboardTarget(event.target)
      ) {
        event.preventDefault();
        flow.goPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flow]);

  if (flow.loading) {
    return <RespondentSkeleton />;
  }

  if (flow.loadError || !flow.form) {
    return (
      <RespondentErrorState
        message={flow.loadError ?? "This form could not be found."}
        onRetry={flow.retry}
      />
    );
  }

  if (flow.submitted) {
    return <ThankYouScreen form={flow.form} />;
  }

  if (flow.questions.length === 0 || !flow.currentQuestion) {
    return <RespondentEmptyState />;
  }

  const theme = flow.form.theme;

  return (
    <main
      className="flex min-h-screen flex-col px-4 py-5 sm:px-6 sm:py-8"
      style={getThemePageStyle(theme, appearance)}
    >
      <div className="fixed right-4 top-4 z-10">
        <AppearanceToggle />
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <Dialog
          open={Boolean(flow.resumeDraft)}
          title="Resume where you left off?"
          description="We found a saved draft for this form."
          onClose={() => void flow.restoreDraft(flow.resumeDraft!)}
        >
          <div className="mt-5 space-y-4">
            <p className="text-sm text-secondary">
              Your answers, current question, and branch history were saved.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
                style={getThemeButtonStyle(theme, false, appearance)}
                onClick={() => void flow.startOver()}
              >
                Start over
              </button>
              <button
                type="button"
                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
                style={getThemeButtonStyle(theme, true, appearance)}
                onClick={() => void flow.restoreDraft(flow.resumeDraft!)}
              >
                Resume
              </button>
            </div>
          </div>
        </Dialog>
        <RespondentProgress
          completedCount={flow.completedCount}
          currentIndex={flow.currentIndex}
          progressPercent={flow.progressPercent}
          theme={theme}
          totalQuestions={flow.questions.length}
        />
        <motion.section
          ref={questionRegionRef}
          aria-live="polite"
          className="flex flex-1 items-center py-8 outline-none"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <QuestionRenderer
            question={flow.currentQuestion}
            questionNumber={flow.currentIndex + 1}
            theme={theme}
            value={flow.answers[flow.currentQuestion.id]}
            error={flow.errors[flow.currentQuestion.id]}
            onAnswerChange={(value) => flow.setAnswer(flow.currentQuestion.id, value)}
            autoFocus
          />
        </motion.section>
        <RespondentNavigation
          currentIndex={flow.currentIndex}
          canGoPrevious={flow.canGoPrevious}
          isLastQuestion={flow.currentIndex === flow.questions.length - 1}
          submitting={flow.submitting}
          theme={theme}
          onPrevious={flow.goPrevious}
          onNext={flow.goForwardOrSubmit}
        />
        <p className="mt-3 text-center text-xs text-stone-500" aria-live="polite">
          {flow.draftSaveStatus === "saving"
            ? "Saving draft..."
            : flow.draftSaveStatus === "saved"
              ? "Draft saved"
              : flow.draftSaveStatus === "error"
                ? "Draft save failed"
                : "Draft autosave is on"}
        </p>
      </div>
    </main>
  );
}
