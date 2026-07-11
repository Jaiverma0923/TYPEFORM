"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { getThemePageStyle } from "@/features/theme/themeStyles";
import { useAppearanceStore } from "@/stores/appearance.store";
import type { Question } from "@/types/question";
import type { FormTheme } from "@/types/theme";

import { EmptyBuilderState } from "./BuilderStates";
import { QuestionRenderer } from "./QuestionRenderer";

type QuestionCanvasProps = {
  question: Question | null;
  questions: Question[];
  hasQuestions: boolean;
  theme: FormTheme;
  onAddQuestion: () => void;
};

export function QuestionCanvas({
  hasQuestions,
  onAddQuestion,
  question,
  questions,
  theme,
}: QuestionCanvasProps) {
  const shouldReduceMotion = useReducedMotion();
  const appearance = useAppearanceStore((state) => state.appearance);
  const questionNumber = question ? questions.findIndex((q) => q.id === question.id) + 1 : 0;

  return (
    <section className="min-h-0 overflow-y-auto p-4 sm:p-6" style={getThemePageStyle(theme, appearance)}>
      {!hasQuestions ? <EmptyBuilderState onAddQuestion={onAddQuestion} /> : null}
      {hasQuestions && !question ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center text-sm text-stone-600">
          Select a question to preview and edit it.
        </div>
      ) : null}
      <AnimatePresence mode="wait">
        {question ? (
          <motion.div
            key={question.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <QuestionRenderer question={question} questionNumber={questionNumber} theme={theme}/>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
