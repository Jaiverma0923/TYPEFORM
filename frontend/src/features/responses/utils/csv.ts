import type { Question } from "../../../types/question.ts";
import type { AnswerValue, FormResponse } from "../../../types/response.ts";

export type CsvExportPayload = {
  form_title: string;
  questions: Question[];
  responses: FormResponse[];
};

export function escapeCsvCell(value: string | number | null) {
  if (value === null) {
    return "";
  }

  const text = String(value);
  const mustQuote = /[",\r\n]/.test(text);
  const escaped = text.replaceAll('"', '""');

  return mustQuote ? `"${escaped}"` : escaped;
}

export function formatCsvAnswer(value: AnswerValue) {
  if (value === null) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value;
  }

  return value.join(", ");
}

export function slugifyForFilename(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "responses";
}

export function getCsvFilename(formTitle: string, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  return `${slugifyForFilename(formTitle)}_${day}.csv`;
}

export function buildResponsesCsv({ questions, responses }: CsvExportPayload) {
  const orderedQuestions = questions.toSorted((a, b) => a.position - b.position);
  const header = [
    "Response ID",
    "Submitted At",
    "Completion Time (seconds)",
    ...orderedQuestions.map((question) => question.title),
  ];

  const rows = responses.map((response) => {
    const answerByQuestionId = new Map(
      response.answers.map((answer) => [answer.question_id, answer.value]),
    );

    return [
      response.id,
      response.submitted_at,
      response.completion_time_seconds,
      ...orderedQuestions.map((question) =>
        formatCsvAnswer(answerByQuestionId.get(question.id) ?? null),
      ),
    ];
  });

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(","))
    .join("\r\n");
}
