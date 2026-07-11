import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";

import { resetStoredFormsForTests } from "./forms.store.ts";
import { formsMockApi } from "./forms.mock.ts";
import { logicRulesMockApi } from "./logicRules.mock.ts";
import { publicMockApi } from "./public.mock.ts";
import { questionsMockApi } from "./questions.mock.ts";

beforeEach(() => {
  resetStoredFormsForTests();
});

test("logic rules are exposed through public form data", async () => {
  const response = await publicMockApi.getPublicForm("event-registration");

  assert.equal(response.data.logic_rules.length, 2);
  assert.equal(response.data.logic_rules[0].id, 1);
  assert.equal(response.data.logic_rules[0].form_id, 2);
});

test("logic rule mock CRUD uses numeric IDs and shared form state", async () => {
  const created = await logicRulesMockApi.createLogicRule(2, {
    source_question_id: 6,
    operator: "equals",
    value: "Design systems",
    action: "go_to_question",
    target_question_id: 10,
  });
  assert.equal(typeof created.data.id, "number");

  const updated = await logicRulesMockApi.updateLogicRule(created.data.id, {
    value: "Product keynote",
  });
  assert.equal(updated.data.value, "Product keynote");

  const publicForm = await publicMockApi.getPublicForm("event-registration");
  assert.ok(publicForm.data.logic_rules.some((rule) => rule.id === created.data.id));

  await logicRulesMockApi.deleteLogicRule(created.data.id);
  const afterDelete = await logicRulesMockApi.getLogicRules(2);
  assert.equal(afterDelete.data.some((rule) => rule.id === created.data.id), false);
});

test("logic rule reorder normalizes priority", async () => {
  await logicRulesMockApi.reorderLogicRules(2, { rule_ids: [2, 1] });
  const rules = await logicRulesMockApi.getLogicRules(2);

  assert.deepEqual(
    rules.data.map((rule) => [rule.id, rule.priority]),
    [
      [2, 0],
      [1, 1],
    ],
  );
});

test("deleting source or target questions removes referenced rules", async () => {
  await questionsMockApi.deleteQuestion(8);
  let publicForm = await publicMockApi.getPublicForm("event-registration");
  assert.equal(publicForm.data.logic_rules.some((rule) => rule.source_question_id === 8), false);

  resetStoredFormsForTests();
  await questionsMockApi.deleteQuestion(10);
  publicForm = await publicMockApi.getPublicForm("event-registration");
  assert.equal(publicForm.data.logic_rules.some((rule) => rule.target_question_id === 10), false);
});

test("publishing rejects invalid forward-jump logic rules after reorder", async () => {
  await questionsMockApi.reorderQuestions(2, {
    question_ids: [10, 3, 4, 5, 6, 7, 8, 9],
  });

  assert.throws(() => formsMockApi.publishForm(2), /Fix invalid logic rules/);
});
