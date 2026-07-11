import assert from "node:assert/strict";
import test from "node:test";

import { publicMockApi } from "./public.mock.ts";
import { questionsMockApi } from "./questions.mock.ts";
import type { QuestionType } from "../types/question.ts";

const supportedTypes: QuestionType[] = [
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "email",
  "number",
  "yes_no",
  "rating",
];

test("getPublicForm returns the published event-registration form with ordered questions", async () => {
  const response = await publicMockApi.getPublicForm("event-registration");
  const form = response.data;

  assert.equal(response.success, true);
  assert.equal(form.slug, "event-registration");
  assert.equal(form.status, "published");
  assert.ok(form.questions.length > 0);
  assert.deepEqual(
    form.questions.map((question) => question.position),
    form.questions.map((_, index) => index),
  );
});

test("event-registration questions use numeric IDs and matching form_id", async () => {
  const response = await publicMockApi.getPublicForm("event-registration");
  const form = response.data;

  for (const question of form.questions) {
    assert.equal(typeof question.id, "number");
    assert.equal(question.form_id, form.id);
  }
});

test("event-registration represents all supported question types", async () => {
  const response = await publicMockApi.getPublicForm("event-registration");
  const actualTypes = new Set(response.data.questions.map((question) => question.type));

  for (const type of supportedTypes) {
    assert.equal(actualTypes.has(type), true, `Missing ${type}`);
  }
});

test("unpublished forms are inaccessible through getPublicForm", async () => {
  await assert.rejects(
    () => publicMockApi.getPublicForm("customer-feedback"),
    /Form not found/,
  );
});

test("builder question updates are visible through getPublicForm", async () => {
  const before = await publicMockApi.getPublicForm("event-registration");
  const question = before.data.questions[0];

  await questionsMockApi.updateQuestion(question.id, {
    title: "Updated attendee name",
  });

  const after = await publicMockApi.getPublicForm("event-registration");

  assert.equal(after.data.questions[0].title, "Updated attendee name");
});
