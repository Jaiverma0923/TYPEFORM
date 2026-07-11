import assert from "node:assert/strict";
import test from "node:test";

import type { Question } from "../../../types/question.ts";
import type { FormResponse } from "../../../types/response.ts";

import {
  buildResponsesCsv,
  escapeCsvCell,
  formatCsvAnswer,
  getCsvFilename,
  slugifyForFilename,
} from "./csv.ts";

const now = "2026-07-11T10:00:00.000Z";

const questions: Question[] = [
  {
    id: 2,
    form_id: 1,
    type: "long_text",
    title: "Notes, quotes and lines",
    description: null,
    required: false,
    position: 1,
    settings: {},
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 1,
    form_id: 1,
    type: "short_text",
    title: "Name",
    description: null,
    required: true,
    position: 0,
    settings: {},
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 3,
    form_id: 1,
    type: "multiple_choice",
    title: "Choices",
    description: null,
    required: false,
    position: 2,
    settings: { options: ["A", "B"] },
    version: 1,
    created_at: now,
    updated_at: now,
  },
  {
    id: 4,
    form_id: 1,
    type: "yes_no",
    title: "Confirmed",
    description: null,
    required: false,
    position: 3,
    settings: {},
    version: 1,
    created_at: now,
    updated_at: now,
  },
];

test("escapeCsvCell quotes commas, quotes and multiline values", () => {
  assert.equal(escapeCsvCell("plain"), "plain");
  assert.equal(escapeCsvCell("hello, world"), '"hello, world"');
  assert.equal(escapeCsvCell('say "hi"'), '"say ""hi"""');
  assert.equal(escapeCsvCell("line 1\nline 2"), '"line 1\nline 2"');
});

test("formatCsvAnswer formats values without JSON serialization", () => {
  assert.equal(formatCsvAnswer(null), "");
  assert.equal(formatCsvAnswer(true), "Yes");
  assert.equal(formatCsvAnswer(false), "No");
  assert.equal(formatCsvAnswer(4), "4");
  assert.equal(formatCsvAnswer(["Workshop", "Keynote"]), "Workshop, Keynote");
});

test("buildResponsesCsv uses current question order and escapes dynamic headers and answers", () => {
  const responses: FormResponse[] = [
    {
      id: 10,
      form_id: 1,
      submitted_at: now,
      completion_time_seconds: 92,
      answers: [
        { question_id: 2, value: "Line 1\nLine 2, with comma and \"quote\"" },
        { question_id: 1, value: "Raghav" },
        { question_id: 3, value: ["Workshop", "Keynote"] },
        { question_id: 4, value: true },
      ],
    },
  ];

  const csv = buildResponsesCsv({
    form_title: "Ignored in CSV body",
    questions,
    responses,
  });

  assert.equal(
    csv,
    [
      'Response ID,Submitted At,Completion Time (seconds),Name,"Notes, quotes and lines",Choices,Confirmed',
      '10,2026-07-11T10:00:00.000Z,92,Raghav,"Line 1\nLine 2, with comma and ""quote""","Workshop, Keynote",Yes',
    ].join("\r\n"),
  );
});

test("buildResponsesCsv exports headers only when there are no responses", () => {
  assert.equal(
    buildResponsesCsv({
      form_title: "Empty",
      questions: questions.slice(0, 2),
      responses: [],
    }),
    "Response ID,Submitted At,Completion Time (seconds),Name,\"Notes, quotes and lines\"",
  );
});

test("getCsvFilename slugifies title and uses YYYY-MM-DD", () => {
  assert.equal(slugifyForFilename("Event Registration!"), "event-registration");
  assert.equal(
    getCsvFilename("Event Registration!", new Date("2026-07-11T23:30:00.000Z")),
    "event-registration_2026-07-11.csv",
  );
});
