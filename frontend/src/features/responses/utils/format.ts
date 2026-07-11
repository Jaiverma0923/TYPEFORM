import type { AnswerValue } from "@/types/response";

export function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCompletionTime(seconds: number | null) {
  if (seconds === null) {
    return "Not recorded";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function formatAnswerValue(value: AnswerValue) {
  if (value === null) {
    return "No answer";
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? value : "No answer";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "No answer";
  }

  return String(value);
}

export function formatAnswerCount(count: number) {
  return `${count} ${count === 1 ? "answer" : "answers"}`;
}
