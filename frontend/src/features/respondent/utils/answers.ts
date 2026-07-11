import type { Question } from "@/types/question";
import type { ResponseAnswer } from "@/types/response";

export type AnswerValue = ResponseAnswer["value"];
export type AnswerMap = Record<number, AnswerValue | undefined>;

export function isEmptyAnswer(value: AnswerValue | undefined) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

export function validateAnswer(question: Question, value: AnswerValue | undefined) {
  if (question.required && isEmptyAnswer(value)) {
    return "This question is required.";
  }

  if (isEmptyAnswer(value)) {
    return null;
  }

  if (question.type === "email") {
    const email = typeof value === "string" ? value.trim() : "";
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return valid ? null : "Enter a valid email address.";
  }

  if (question.type === "number") {
    const numberValue = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numberValue) ? null : "Enter a valid number.";
  }

  if (question.type === "multiple_choice" || question.type === "dropdown") {
    const options = question.settings.options ?? [];
    return typeof value === "string" && options.includes(value)
      ? null
      : "Choose one of the available options.";
  }

  if (question.type === "rating") {
    const min = question.settings.min ?? 1;
    const max = question.settings.max ?? 5;
    const rating = typeof value === "number" ? value : Number(value);

    if (!Number.isInteger(rating) || rating < min || rating > max) {
      return `Choose a rating between ${min} and ${max}.`;
    }
  }

  return null;
}

export function normalizeAnswerValue(question: Question, value: AnswerValue | undefined): AnswerValue {
  if (isEmptyAnswer(value)) {
    return null;
  }

  if (question.type === "number" || question.type === "rating") {
    return typeof value === "number" ? value : Number(value);
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return value ?? null;
}

export function buildResponseAnswers(questions: Question[], answers: AnswerMap): ResponseAnswer[] {
  return questions.map((question) => ({
    question_id: question.id,
    value: normalizeAnswerValue(question, answers[question.id]),
  }));
}

export function getCompletedQuestionCount(questions: Question[], answers: AnswerMap) {
  return questions.filter((question) => !isEmptyAnswer(answers[question.id])).length;
}
