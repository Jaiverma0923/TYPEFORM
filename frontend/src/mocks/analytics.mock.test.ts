import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { analyticsMockApi } from "./analytics.mock.ts";
import { resetStoredFormsForTests } from "./forms.store.ts";
import { publicMockApi } from "./public.mock.ts";
import { getStoredResponses, resetStoredResponsesForTests } from "./responses.store.ts";

beforeEach(() => {
  resetStoredFormsForTests();
  resetStoredResponsesForTests();
});

test("getAnalytics computes seeded event-registration analytics", async () => {
  const response = await analyticsMockApi.getAnalytics(2);
  const analytics = response.data;

  assert.equal(response.success, true);
  assert.equal(analytics.form_id, 2);
  assert.equal(analytics.form_title, "Event Registration");
  assert.equal(analytics.total_responses, 1);
  assert.equal(analytics.average_completion_time_seconds, 91);
  assert.deepEqual(
    analytics.questions.map((question) => question.question_id),
    [3, 4, 5, 6, 7, 8, 9, 10],
  );
});

test("getAnalytics computes answered, skipped, choice, yes/no and rating summaries", async () => {
  await publicMockApi.submitResponse("event-registration", {
    answers: [
      { question_id: 3, value: "   " },
      { question_id: 4, value: "raghav.analytics@example.com" },
      { question_id: 5, value: "General admission" },
      { question_id: 6, value: "Product keynote" },
      { question_id: 7, value: null },
      { question_id: 8, value: false },
      { question_id: 9, value: 4 },
      { question_id: 10, value: "Analytics long text." },
    ],
    completion_time_seconds: 57,
    form_version: 2,
  });

  const analytics = (await analyticsMockApi.getAnalytics(2)).data;
  const shortText = analytics.questions.find((question) => question.question_id === 3);
  const dropdown = analytics.questions.find((question) => question.question_id === 5);
  const multipleChoice = analytics.questions.find((question) => question.question_id === 6);
  const number = analytics.questions.find((question) => question.question_id === 7);
  const yesNo = analytics.questions.find((question) => question.question_id === 8);
  const rating = analytics.questions.find((question) => question.question_id === 9);

  assert.equal(analytics.total_responses, 2);
  assert.equal(analytics.average_completion_time_seconds, 74);
  assert.equal(shortText?.answered_count, 1);
  assert.equal(shortText?.skipped_count, 1);
  assert.equal(number?.answered_count, 1);
  assert.equal(number?.skipped_count, 1);

  assert.deepEqual(dropdown?.summary, {
    counts: [
      { label: "General admission", count: 1, percentage: 50 },
      { label: "Workshop pass", count: 1, percentage: 50 },
      { label: "VIP", count: 0, percentage: 0 },
    ],
  });
  assert.deepEqual(multipleChoice?.summary, {
    counts: [
      { label: "Product keynote", count: 1, percentage: 50 },
      { label: "Design systems", count: 1, percentage: 50 },
      { label: "Growth workshop", count: 0, percentage: 0 },
    ],
  });
  assert.deepEqual(yesNo?.summary, { yes: 1, no: 1 });
  assert.deepEqual(rating?.summary, {
    average: 4.5,
    distribution: [
      { value: 1, count: 0 },
      { value: 2, count: 0 },
      { value: 3, count: 0 },
      { value: 4, count: 1 },
      { value: 5, count: 1 },
    ],
  });
});

test("getAnalytics reflects newly submitted responses and does not mutate stored data", async () => {
  const before = getStoredResponses();

  await publicMockApi.submitResponse("event-registration", {
    answers: [
      { question_id: 3, value: "Analytics Identity" },
      { question_id: 4, value: "identity.analytics@example.com" },
      { question_id: 5, value: "VIP" },
      { question_id: 6, value: "Growth workshop" },
      { question_id: 7, value: 3 },
      { question_id: 8, value: true },
      { question_id: 9, value: 3 },
      { question_id: 10, value: "Analytics identity long text." },
    ],
    completion_time_seconds: 120,
    form_version: 2,
  });

  const afterSubmit = getStoredResponses();
  const analytics = await analyticsMockApi.getAnalytics(2);
  const afterAnalytics = getStoredResponses();

  assert.equal(analytics.data.total_responses, 2);
  assert.equal(afterSubmit.length, before.length + 1);
  assert.deepEqual(afterAnalytics, afterSubmit);
});

test("getAnalytics handles forms with no responses", async () => {
  const analytics = (await analyticsMockApi.getAnalytics(3)).data;

  assert.equal(analytics.form_id, 3);
  assert.equal(analytics.total_responses, 0);
  assert.equal(analytics.average_completion_time_seconds, null);
  assert.deepEqual(analytics.questions, []);
});

test("getAnalytics rejects missing forms", async () => {
  await assert.rejects(
    () => analyticsMockApi.getAnalytics(999_999),
    /Form not found/,
  );
});
