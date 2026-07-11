import { validateLogicRule } from "../features/logic/rules.ts";
import type { ApiResponse } from "@/types/common";
import type {
  CreateLogicRulePayload,
  LogicRule,
  ReorderLogicRulesPayload,
  UpdateLogicRulePayload,
} from "@/types/logic";

import {
  cloneLogicRule,
  findAllStoredLogicRules,
  findStoredForm,
  findStoredLogicRule,
  normalizeLogicRules,
  replaceStoredForm,
} from "./forms.store.ts";
import { mockResponse, shouldFailMock } from "./helpers.ts";
import { createNumericId } from "./mockIds.ts";

function failIfRequested(operation: string) {
  if (shouldFailMock(operation)) {
    throw new Error("Mock request failed.");
  }
}

function getAllRuleIds() {
  return findAllStoredLogicRules().map((rule) => rule.id);
}

function assertValidRule(rule: LogicRule, form_id: number) {
  const form = findStoredForm(form_id);
  const result = validateLogicRule(rule, form.questions);

  if (!result.valid) {
    throw new Error(result.errors[0] ?? "Logic rule is invalid.");
  }
}

export const logicRulesMockApi = {
  getLogicRules(form_id: number): Promise<ApiResponse<LogicRule[]>> {
    failIfRequested("getLogicRules");
    const form = findStoredForm(form_id);
    return mockResponse("Logic rules fetched.", form.logic_rules.map(cloneLogicRule));
  },

  createLogicRule(
    form_id: number,
    payload: CreateLogicRulePayload,
  ): Promise<ApiResponse<LogicRule>> {
    failIfRequested("createLogicRule");
    const form = findStoredForm(form_id);
    const now = new Date().toISOString();
    const rule: LogicRule = {
      id: createNumericId(getAllRuleIds()),
      form_id,
      ...payload,
      priority: form.logic_rules.length,
      created_at: now,
      updated_at: now,
    };
    assertValidRule(rule, form_id);

    const updatedForm = replaceStoredForm(form_id, (item) => ({
      ...item,
      logic_rules: normalizeLogicRules([...item.logic_rules, rule]),
      version: item.version + 1,
      updated_at: now,
    }));
    const created = updatedForm.logic_rules.find((item) => item.id === rule.id);

    if (!created) {
      throw new Error("Logic rule could not be created.");
    }

    return mockResponse("Logic rule created.", created);
  },

  updateLogicRule(
    rule_id: number,
    payload: UpdateLogicRulePayload,
  ): Promise<ApiResponse<LogicRule>> {
    failIfRequested("updateLogicRule");
    const { form, rule } = findStoredLogicRule(rule_id);
    const now = new Date().toISOString();
    const updatedRule: LogicRule = {
      ...rule,
      ...payload,
      id: rule.id,
      form_id: rule.form_id,
      priority: rule.priority,
      updated_at: now,
    };
    assertValidRule(updatedRule, form.id);

    replaceStoredForm(form.id, (item) => ({
      ...item,
      logic_rules: item.logic_rules.map((current) =>
        current.id === rule_id ? updatedRule : current,
      ),
      version: item.version + 1,
      updated_at: now,
    }));

    return mockResponse("Logic rule updated.", cloneLogicRule(updatedRule));
  },

  deleteLogicRule(rule_id: number): Promise<ApiResponse<{ id: number }>> {
    failIfRequested("deleteLogicRule");
    const { form } = findStoredLogicRule(rule_id);
    const now = new Date().toISOString();

    replaceStoredForm(form.id, (item) => ({
      ...item,
      logic_rules: normalizeLogicRules(item.logic_rules.filter((rule) => rule.id !== rule_id)),
      version: item.version + 1,
      updated_at: now,
    }));

    return mockResponse("Logic rule deleted.", { id: rule_id });
  },

  reorderLogicRules(
    form_id: number,
    payload: ReorderLogicRulesPayload,
  ): Promise<ApiResponse<ReorderLogicRulesPayload & { form_id: number }>> {
    failIfRequested("reorderLogicRules");
    const form = findStoredForm(form_id);
    const existingIds = new Set(form.logic_rules.map((rule) => rule.id));
    const uniqueIds = new Set(payload.rule_ids);

    if (
      uniqueIds.size !== form.logic_rules.length ||
      payload.rule_ids.some((rule_id) => !existingIds.has(rule_id))
    ) {
      throw new Error("Logic rule order is invalid.");
    }

    const now = new Date().toISOString();
    replaceStoredForm(form_id, (item) => {
      const ruleById = new Map(item.logic_rules.map((rule) => [rule.id, rule]));
      const logic_rules = payload.rule_ids.map((rule_id, index) => {
        const rule = ruleById.get(rule_id);

        if (!rule) {
          throw new Error("Logic rule order is invalid.");
        }

        return {
          ...rule,
          priority: index,
          updated_at: now,
        };
      });

      return {
        ...item,
        logic_rules,
        version: item.version + 1,
        updated_at: now,
      };
    });

    return mockResponse("Logic rules reordered.", { form_id, rule_ids: payload.rule_ids });
  },
};
