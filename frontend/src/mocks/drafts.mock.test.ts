import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import { formsMockApi } from "./forms.mock.ts";
import { draftsMockApi } from "./drafts.mock.ts";
import { getStoredDrafts, resetStoredDraftsForTests } from "./drafts.store.ts";
import { resetStoredFormsForTests } from "./forms.store.ts";

beforeEach(() => {
  resetStoredFormsForTests();
  resetStoredDraftsForTests();
});

test("createDraft creates one active numeric draft per slug", async () => {
  const created = await draftsMockApi.createDraft("event-registration");
  const resumed = await draftsMockApi.createDraft("event-registration");

  assert.equal(typeof created.data.id, "number");
  assert.equal(created.data.id, resumed.data.id);
  assert.equal(created.data.slug, "event-registration");
  assert.equal(created.data.form_id, 2);
  assert.deepEqual(created.data.visited_question_ids, [3]);
});

test("updateDraft persists answers, current question, history and form version", async () => {
  const created = await draftsMockApi.createDraft("event-registration");
  const answers = [
    { question_id: 3, value: "Raghav Draft" },
    { question_id: 8, value: false },
  ];
  const history = [3, 4, 8, 10];
  const updated = await draftsMockApi.updateDraft(created.data.id, {
    answers,
    current_question_id: 10,
    visited_question_ids: history,
    started_at: created.data.started_at,
    form_version: 2,
  });

  assert.deepEqual(updated.data.answers, answers);
  assert.deepEqual(updated.data.visited_question_ids, history);
  assert.equal(updated.data.current_question_id, 10);
  assert.equal(updated.data.form_version, 2);
});

test("draft storage deep-copies answer arrays and history", async () => {
  const created = await draftsMockApi.createDraft("event-registration");
  const answers = [{ question_id: 5, value: ["Workshop pass"] }];
  const history = [3, 4, 5];
  const updated = await draftsMockApi.updateDraft(created.data.id, {
    answers,
    current_question_id: 5,
    visited_question_ids: history,
    started_at: created.data.started_at,
    form_version: 2,
  });

  answers[0].value = ["VIP"];
  history.push(10);
  const stored = getStoredDrafts().find((draft) => draft.id === updated.data.id);

  assert.deepEqual(stored?.answers[0].value, ["Workshop pass"]);
  assert.deepEqual(stored?.visited_question_ids, [3, 4, 5]);
});

test("deleteDraft removes resumable draft for start over or completed submission", async () => {
  const created = await draftsMockApi.createDraft("event-registration");
  await draftsMockApi.deleteDraft(created.data.id);
  const draft = await draftsMockApi.getDraft("event-registration");

  assert.equal(draft.data, null);
});

test("drafts are isolated by slug", async () => {
  await formsMockApi.publishForm(1);
  const first = await draftsMockApi.createDraft("event-registration");
  const second = await draftsMockApi.createDraft("customer-feedback");

  assert.notEqual(first.data.id, second.data.id);
  assert.equal((await draftsMockApi.getDraft("event-registration")).data?.id, first.data.id);
  assert.equal((await draftsMockApi.getDraft("customer-feedback")).data?.id, second.data.id);
});
