"use client";

import {
  getThemeButtonStyle,
  getEffectiveTheme,
  getThemeInputStyle,
  getThemeMutedTextStyle,
  getThemeSurfaceStyle,
} from "@/features/theme/themeStyles";
import { useAppearanceStore } from "@/stores/appearance.store";
import type { Question } from "@/types/question";
import type { ResponseAnswer } from "@/types/response";
import type { FormTheme } from "@/types/theme";

type QuestionRendererProps = {
  question: Question;
  value?: ResponseAnswer["value"];
  error?: string | null;
  autoFocus?: boolean;
  theme?: FormTheme;
  onAnswerChange?: (value: ResponseAnswer["value"]) => void;
};

type QuestionHeaderProps = {
  question: Question;
  questionNumber: number;
  theme?: FormTheme;
};

type QuestionRendererComponentProps = QuestionRendererProps & {
  questionNumber: number;
};

function QuestionHeader({
  question,
  questionNumber,
  theme,
}: QuestionHeaderProps) {
  const appearance = useAppearanceStore((state) => state.appearance);
  const effectiveTheme = theme ? getEffectiveTheme(theme, appearance) : null;

  return (
    <div>
      <p className="text-sm font-medium text-stone-500" style={theme ? getThemeMutedTextStyle(theme, appearance) : undefined}>
        Question {questionNumber}
      </p>
      <h2
        className="mt-2 text-2xl font-semibold text-stone-950"
        style={effectiveTheme ? { color: effectiveTheme.colors.text, fontWeight: effectiveTheme.typography.heading_weight } : undefined}
      >
        {question.title}
        {question.required ? <span className="ml-1 text-red-600">*</span> : null}
      </h2>
      {question.description ? (
        <p
          className="mt-2 text-sm text-stone-600"
          style={
            effectiveTheme
              ? {
                  ...getThemeMutedTextStyle(effectiveTheme, appearance),
                  fontWeight: effectiveTheme.typography.body_weight,
                }
              : undefined
          }
        >
          {question.description}
        </p>
      ) : null}
    </div>
  );
}

function TextInputPreview({
  autoFocus,
  error,
  multiline = false,
  onAnswerChange,
  question,
  theme,
  value,
}: QuestionRendererProps & { multiline?: boolean }) {
  const appearance = useAppearanceStore((state) => state.appearance);
  const placeholder = question.settings.placeholder ?? "Type your answer";
  const stringValue = typeof value === "string" || typeof value === "number" ? String(value) : "";

  if (multiline) {
    return (
      <textarea
        className="mt-8 min-h-32 w-full resize-none rounded-md border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
        style={theme ? getThemeInputStyle(theme, appearance) : undefined}
        placeholder={placeholder}
        aria-label="Answer"
        aria-invalid={Boolean(error)}
        autoFocus={autoFocus}
        readOnly={!onAnswerChange}
        value={stringValue}
        onChange={(event) => onAnswerChange?.(event.target.value)}
      />
    );
  }

  return (
    <input
      className="mt-8 w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
      style={theme ? getThemeInputStyle(theme, appearance) : undefined}
      placeholder={placeholder}
      aria-label="Answer"
      aria-invalid={Boolean(error)}
      autoFocus={autoFocus}
      readOnly={!onAnswerChange}
      value={stringValue}
      type={question.type === "email" ? "email" : question.type === "number" ? "number" : "text"}
      onChange={(event) => {
        if (question.type === "number") {
          onAnswerChange?.(event.target.value);
        } else {
          onAnswerChange?.(event.target.value);
        }
      }}
    />
  );
}

function ChoicePreview({ onAnswerChange, question, theme, value }: QuestionRendererProps) {
  const appearance = useAppearanceStore((state) => state.appearance);
  const options = question.settings.options ?? ["Option 1"];

  return (
    <div className="mt-8 space-y-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={
            value === option
              ? "block w-full rounded-md border border-stone-950 bg-stone-950 px-4 py-3 text-left text-sm text-white"
              : "block w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-left text-sm text-stone-800 hover:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900"
          }
          style={theme ? getThemeButtonStyle(theme, value === option, appearance) : undefined}
          onClick={() => onAnswerChange?.(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function DropdownPreview({ onAnswerChange, question, theme, value }: QuestionRendererProps) {
  const appearance = useAppearanceStore((state) => state.appearance);

  return (
    <select
      className="mt-8 w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10"
      style={theme ? getThemeInputStyle(theme, appearance) : undefined}
      aria-label="Answer"
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onAnswerChange?.(event.target.value)}
    >
      <option value="" disabled>
        Select an option
      </option>
      {(question.settings.options ?? ["Option 1"]).map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function YesNoPreview({
  onAnswerChange,
  theme,
  value,
}: Pick<QuestionRendererProps, "onAnswerChange" | "theme" | "value">) {
  const appearance = useAppearanceStore((state) => state.appearance);

  return (
    <div className="mt-8 flex gap-3">
      <button
        type="button"
        className={
          value === true
            ? "rounded-md border border-stone-950 bg-stone-950 px-5 py-3 text-white"
            : "rounded-md border border-stone-300 bg-white px-5 py-3 hover:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900"
        }
        style={theme ? getThemeButtonStyle(theme, value === true, appearance) : undefined}
        onClick={() => onAnswerChange?.(true)}
      >
        Yes
      </button>
      <button
        type="button"
        className={
          value === false
            ? "rounded-md border border-stone-950 bg-stone-950 px-5 py-3 text-white"
            : "rounded-md border border-stone-300 bg-white px-5 py-3 hover:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900"
        }
        style={theme ? getThemeButtonStyle(theme, value === false, appearance) : undefined}
        onClick={() => onAnswerChange?.(false)}
      >
        No
      </button>
    </div>
  );
}

function RatingPreview({ onAnswerChange, question, theme, value }: QuestionRendererProps) {
  const appearance = useAppearanceStore((state) => state.appearance);
  const min = question.settings.min ?? 1;
  const max = question.settings.max ?? 5;

  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((ratingValue) => (
        <button
          key={ratingValue}
          type="button"
          className={
            Number(value) === ratingValue
              ? "flex h-11 w-11 items-center justify-center rounded-md border border-stone-950 bg-stone-950 text-sm font-medium text-white"
              : "flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 bg-white text-sm font-medium text-stone-800 hover:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-900"
          }
          style={theme ? getThemeButtonStyle(theme, Number(value) === ratingValue, appearance) : undefined}
          onClick={() => onAnswerChange?.(ratingValue)}
        >
          {ratingValue}
        </button>
      ))}
    </div>
  );
}

/*
                {file.name} · {formatBytes(file.size_bytes)} · {getExtension(file.name)}
*/

export function QuestionRenderer({
  question,
  questionNumber,
  value,
  error,
  autoFocus,
  onAnswerChange,
  theme,
}: QuestionRendererComponentProps) {
  const appearance = useAppearanceStore((state) => state.appearance);

  return (
    <div
      className="mx-auto w-full max-w-2xl rounded-lg border border-transparent bg-white px-6 py-8 shadow-sm"
      style={theme ? getThemeSurfaceStyle(theme, appearance) : undefined}
    >
      <QuestionHeader question={question} questionNumber={questionNumber} theme={theme}/>
      {question.type === "short_text" || question.type === "email" || question.type === "number" ? (
        <TextInputPreview
          question={question}
          value={value}
          error={error}
          autoFocus={autoFocus}
          theme={theme}
          onAnswerChange={onAnswerChange}
        />
      ) : null}
      {question.type === "long_text" ? (
        <TextInputPreview
          question={question}
          value={value}
          error={error}
          autoFocus={autoFocus}
          theme={theme}
          onAnswerChange={onAnswerChange}
          multiline
        />
      ) : null}
      {question.type === "multiple_choice" ? (
        <ChoicePreview question={question} value={value} theme={theme} onAnswerChange={onAnswerChange} />
      ) : null}
      {question.type === "dropdown" ? (
        <DropdownPreview question={question} value={value} theme={theme} onAnswerChange={onAnswerChange} />
      ) : null}
      {question.type === "yes_no" ? (
        <YesNoPreview value={value} theme={theme} onAnswerChange={onAnswerChange} />
      ) : null}
      {question.type === "rating" ? (
        <RatingPreview question={question} value={value} theme={theme} onAnswerChange={onAnswerChange} />
      ) : null}
      {error ? (
        <p className="mt-4 text-sm text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
