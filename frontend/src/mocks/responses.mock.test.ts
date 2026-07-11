import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { publicMockApi } from "./public.mock.ts";
import { responsesMockApi } from "./responses.mock.ts";
import { getStoredResponses, resetStoredResponsesForTests } from "./responses.store.ts";
import { questionsMockApi } from "./questions.mock.ts";
import { resetStoredFormsForTests } from "./forms.store.ts";
import { draftsMockApi } from "./drafts.mock.ts";
import type { ResponseAnswer } from "../types/response.ts";

beforeEach(() => {
  resetStoredFormsForTests();
  resetStoredResponsesForTests();
});

test("getResponses returns seeded event-registration responses", async () => {
  const response = await responsesMockApi.getResponses(2);

  assert.equal(response.success, true);
  assert.equal(response.data.form.id, 2);
  assert.ok(response.data.items.length > 0);
  assert.equal(typeof response.data.items[0].id, "number");
  assert.ok(response.data.items[0].preview.length > 0);
});

test("submitted public responses appear in the response list", async () => {
  const before = await responsesMockApi.getResponses(2);

  await publicMockApi.submitResponse("event-registration", {
    answers: [
      { question_id: 3, value: "Morgan Lee" },
      { question_id: 4, value: "morgan@example.com" },
      { question_id: 5, value: "General admission" },
      { question_id: 6, value: "Product keynote" },
      { question_id: 7, value: 1 },
      { question_id: 8, value: false },
      { question_id: 9, value: 4 },
      { question_id: 10, value: "No notes." },
    ],
    completion_time_seconds: 88,
    form_version: 2,
  });

  const after = await responsesMockApi.getResponses(2);

  assert.equal(after.data.items.length, before.data.items.length + 1);
  assert.equal(after.data.items[0].preview[0].value, "Morgan Lee");
});

test("missing response IDs reject instead of falling back", async () => {
  await assert.rejects(
    () => responsesMockApi.getResponse(999_999),
    /Response not found/,
  );
});

test("submitted response answers remain matched by question_id through list and detail", async () => {
  const submittedAnswers: ResponseAnswer[] = [
    { question_id: 3, value: "Raghav Test" },
    { question_id: 4, value: "raghav.test@example.com" },
    { question_id: 5, value: "Delhi" },
    { question_id: 6, value: "Workshop" },
    { question_id: 7, value: 27 },
    { question_id: 8, value: true },
    { question_id: 9, value: 4 },
    { question_id: 10, value: "This is the exact long answer." },
  ];
  const expectedByQuestionId = new Map(
    submittedAnswers.map((answer) => [answer.question_id, answer.value]),
  );

  const submitResponse = await publicMockApi.submitResponse("event-registration", {
    answers: submittedAnswers,
    completion_time_seconds: 123,
    form_version: 2,
  });

  const listResponse = await responsesMockApi.getResponses(2);
  const listItem = listResponse.data.items.find(
    (item) => item.id === submitResponse.data.id,
  );

  assert.ok(listItem);
  assert.deepEqual(
    listItem.preview.map((answer) => [answer.question_id, answer.value]),
    [
      [3, "Raghav Test"],
      [4, "raghav.test@example.com"],
      [5, "Delhi"],
    ],
  );

  const detailResponse = await responsesMockApi.getResponse(submitResponse.data.id);

  assert.equal(detailResponse.data.form.id, 2);
  assert.deepEqual(
    detailResponse.data.answers.map((answer) => answer.question_id),
    [3, 4, 5, 6, 7, 8, 9, 10],
  );

  for (const answer of detailResponse.data.answers) {
    assert.equal(answer.value, expectedByQuestionId.get(answer.question_id));
  }

  assert.deepEqual(
    detailResponse.data.answers.map((answer) => [
      answer.question_id,
      answer.question_title,
      answer.question_type,
    ]),
    [
      [3, "What is your full name?", "short_text"],
      [4, "What email should we use for your ticket?", "email"],
      [5, "Which ticket type do you need?", "dropdown"],
      [6, "Which session are you most interested in?", "multiple_choice"],
      [7, "How many people are in your group?", "number"],
      [8, "Do you need accessibility support?", "yes_no"],
      [9, "How excited are you for the event?", "rating"],
      [10, "Anything else we should know?", "long_text"],
    ],
  );
});

test("question reorder changes display order without changing answer identity", async () => {
  const submittedAnswers: ResponseAnswer[] = [
    { question_id: 3, value: "Order Identity Name" },
    { question_id: 4, value: "identity@example.com" },
    { question_id: 5, value: "Ticket Identity" },
    { question_id: 6, value: "Session Identity" },
    { question_id: 7, value: 7 },
    { question_id: 8, value: false },
    { question_id: 9, value: 3 },
    { question_id: 10, value: "Order identity long text." },
  ];
  const expectedByQuestionId = new Map(
    submittedAnswers.map((answer) => [answer.question_id, answer.value]),
  );

  const submitResponse = await publicMockApi.submitResponse("event-registration", {
    answers: submittedAnswers,
    completion_time_seconds: 77,
    form_version: 2,
  });

  await questionsMockApi.reorderQuestions(2, {
    question_ids: [10, 9, 8, 7, 6, 5, 4, 3],
  });

  const detailResponse = await responsesMockApi.getResponse(submitResponse.data.id);

  assert.deepEqual(
    detailResponse.data.answers.map((answer) => answer.question_id),
    [10, 9, 8, 7, 6, 5, 4, 3],
  );

  for (const answer of detailResponse.data.answers) {
    assert.equal(answer.value, expectedByQuestionId.get(answer.question_id));
  }

  await questionsMockApi.reorderQuestions(2, {
    question_ids: [3, 4, 5, 6, 7, 8, 9, 10],
  });
});

test("submitted answers are deep-copied and responses stay separate", async () => {
  const mutableOptions = ["Original A", "Original B"];
  const payload = {
    answers: [
      { question_id: 3, value: "First immutable response" },
      { question_id: 4, value: "first.immutable@example.com" },
      { question_id: 5, value: "First dropdown" },
      { question_id: 6, value: mutableOptions },
      { question_id: 7, value: 11 },
      { question_id: 8, value: true },
      { question_id: 9, value: 2 },
      { question_id: 10, value: "First immutable long text." },
    ] satisfies ResponseAnswer[],
    completion_time_seconds: 64,
    form_version: 2,
  };

  const firstSubmit = await publicMockApi.submitResponse(
    "event-registration",
    payload,
  );

  payload.answers[0].value = "Mutated after submit";
  mutableOptions[0] = "Mutated option";

  const secondSubmit = await publicMockApi.submitResponse("event-registration", {
    answers: [
      { question_id: 3, value: "Second separate response" },
      { question_id: 4, value: "second.separate@example.com" },
      { question_id: 5, value: "Second dropdown" },
      { question_id: 6, value: "Second choice" },
      { question_id: 7, value: 22 },
      { question_id: 8, value: false },
      { question_id: 9, value: 5 },
      { question_id: 10, value: "Second separate long text." },
    ],
    completion_time_seconds: 65,
    form_version: 2,
  });

  const firstDetail = await responsesMockApi.getResponse(firstSubmit.data.id);
  const secondDetail = await responsesMockApi.getResponse(secondSubmit.data.id);

  assert.equal(firstDetail.data.answers[0].value, "First immutable response");
  assert.deepEqual(firstDetail.data.answers[3].value, ["Original A", "Original B"]);
  assert.equal(secondDetail.data.answers[0].value, "Second separate response");
  assert.notEqual(firstDetail.data.id, secondDetail.data.id);

  const storedResponses = getStoredResponses();
  assert.ok(storedResponses.some((response) => response.id === 2));
  assert.ok(storedResponses.some((response) => response.id === firstSubmit.data.id));
  assert.ok(storedResponses.some((response) => response.id === secondSubmit.data.id));
});

test("two submissions append unique newest-first responses and sync response_count", async () => {
  const seededResponses = getStoredResponses().filter(
    (response) => response.form_id === 2,
  );
  assert.equal(seededResponses.length, 1);
  const seededResponse = seededResponses[0];
  const seededSnapshot = JSON.parse(JSON.stringify(seededResponse)) as typeof seededResponse;

  const responseAAnswers: ResponseAnswer[] = [
    { question_id: 3, value: "Raghav Test" },
    { question_id: 4, value: "raghav.test@example.com" },
    { question_id: 5, value: "Delhi" },
    { question_id: 6, value: "Workshop" },
    { question_id: 7, value: 27 },
    { question_id: 8, value: true },
    { question_id: 9, value: 4 },
    { question_id: 10, value: "This is the exact long answer." },
  ];
  const responseBAnswers: ResponseAnswer[] = [
    { question_id: 3, value: "Raghav Second" },
    { question_id: 4, value: "raghav.second@example.com" },
    { question_id: 5, value: "Mumbai" },
    { question_id: 6, value: "Keynote" },
    { question_id: 7, value: 31 },
    { question_id: 8, value: false },
    { question_id: 9, value: 5 },
    { question_id: 10, value: "This is the second exact long answer." },
  ];

  const responseA = await publicMockApi.submitResponse("event-registration", {
    answers: responseAAnswers,
    completion_time_seconds: 101,
    form_version: 2,
  });
  const afterA = getStoredResponses().filter((response) => response.form_id === 2);

  assert.equal(afterA.length, 2);
  assert.equal(typeof responseA.data.id, "number");
  assert.notEqual(responseA.data.id, seededResponse.id);
  assert.deepEqual(
    afterA.find((response) => response.id === seededResponse.id),
    seededSnapshot,
  );

  const responseB = await publicMockApi.submitResponse("event-registration", {
    answers: responseBAnswers,
    completion_time_seconds: 202,
    form_version: 2,
  });
  const afterB = getStoredResponses().filter((response) => response.form_id === 2);

  assert.equal(afterB.length, 3);
  assert.notEqual(responseB.data.id, responseA.data.id);
  assert.notEqual(responseB.data.id, seededResponse.id);

  const responseIds = afterB.map((response) => response.id);
  assert.equal(new Set(responseIds).size, responseIds.length);
  assert.deepEqual(
    afterB.find((response) => response.id === responseA.data.id)?.answers,
    responseAAnswers,
  );
  assert.deepEqual(
    afterB.find((response) => response.id === seededResponse.id),
    seededSnapshot,
  );

  const listResponse = await responsesMockApi.getResponses(2);
  assert.equal(listResponse.data.pagination.total, 3);
  assert.equal(listResponse.data.items.length, 3);
  assert.deepEqual(
    listResponse.data.items.map((item) => item.id),
    [responseB.data.id, responseA.data.id, seededResponse.id],
  );
  assert.deepEqual(
    listResponse.data.items.map((item) => item.preview[0].value),
    ["Raghav Second", "Raghav Test", "Avery Johnson"],
  );

  const detailA = await responsesMockApi.getResponse(responseA.data.id);
  const detailB = await responsesMockApi.getResponse(responseB.data.id);

  assert.equal(detailA.data.form.id, 2);
  assert.equal(detailB.data.form.id, 2);
  assert.deepEqual(
    detailA.data.answers.map((answer) => [answer.question_id, answer.value]),
    responseAAnswers.map((answer) => [answer.question_id, answer.value]),
  );
  assert.deepEqual(
    detailB.data.answers.map((answer) => [answer.question_id, answer.value]),
    responseBAnswers.map((answer) => [answer.question_id, answer.value]),
  );

  const publicForm = await publicMockApi.getPublicForm("event-registration");
  assert.equal(publicForm.data.response_count, 3);
});

test("exportResponsesCsv uses current form state, new responses and no drafts", async () => {
  await questionsMockApi.updateQuestion(3, {
    title: "Full name, updated",
  });

  const draft = await draftsMockApi.createDraft("event-registration");
  await draftsMockApi.updateDraft(draft.data.id, {
    form_version: draft.data.form_version,
    answers: [
      { question_id: 3, value: "Draft Only Name" },
      { question_id: 4, value: "draft-only@example.com" },
    ],
    current_question_id: 4,
    visited_question_ids: [3, 4],
    started_at: draft.data.started_at,
    completed: false,
  });

  const submitted = await publicMockApi.submitResponse("event-registration", {
    answers: [
      { question_id: 3, value: "CSV Export Name" },
      { question_id: 4, value: "csv.export@example.com" },
      { question_id: 5, value: "VIP" },
      { question_id: 6, value: ["Product keynote", "Growth workshop"] },
      { question_id: 7, value: 5 },
      { question_id: 8, value: true },
      { question_id: 9, value: 4 },
      { question_id: 10, value: "Line one\nLine two, with comma and \"quote\"" },
    ],
    completion_time_seconds: 333,
    form_version: 2,
  });

  const exportResult = await responsesMockApi.exportResponsesCsv(2);
  const csv = await exportResult.blob.text();

  assert.match(exportResult.filename, /^event-registration_\d{4}-\d{2}-\d{2}\.csv$/);
  assert.match(exportResult.blob.type, /^text\/csv/);
  assert.ok(csv.startsWith('Response ID,Submitted At,Completion Time (seconds),"Full name, updated"'));
  assert.match(csv, new RegExp(`^${submitted.data.id},`, "m"));
  assert.match(csv, /CSV Export Name/);
  assert.match(csv, /csv\.export@example\.com/);
  assert.match(csv, /"Product keynote, Growth workshop"/);
  assert.match(csv, /,Yes,/);
  assert.match(csv, /"Line one\nLine two, with comma and ""quote"""/);
  assert.doesNotMatch(csv, /Draft Only Name/);
});

test("exportResponsesCsv returns headers only for a form with no responses", async () => {
  const exportResult = await responsesMockApi.exportResponsesCsv(3);
  const csv = await exportResult.blob.text();

  assert.equal(exportResult.filename.replace(/_\d{4}-\d{2}-\d{2}\.csv$/, ""), "product-research");
  assert.equal(csv, "Response ID,Submitted At,Completion Time (seconds)");
});
