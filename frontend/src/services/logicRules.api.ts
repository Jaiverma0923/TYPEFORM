import { env } from "@/lib/env";
import { logicRulesMockApi } from "@/mocks/logicRules.mock";
import type { ApiResponse } from "@/types/common";
import type {
  CreateLogicRulePayload,
  LogicRule,
  ReorderLogicRulesPayload,
  UpdateLogicRulePayload,
} from "@/types/logic";

import { api } from "./api";

const logicRulesAxiosApi = {
  async getLogicRules(form_id: number): Promise<ApiResponse<LogicRule[]>> {
    const response = await api.get<ApiResponse<LogicRule[]>>(`/forms/${form_id}/logic-rules`);
    return response.data;
  },
  async createLogicRule(
    form_id: number,
    payload: CreateLogicRulePayload,
  ): Promise<ApiResponse<LogicRule>> {
    const response = await api.post<ApiResponse<LogicRule>>(
      `/forms/${form_id}/logic-rules`,
      payload,
    );
    return response.data;
  },
  async updateLogicRule(
    rule_id: number,
    payload: UpdateLogicRulePayload,
  ): Promise<ApiResponse<LogicRule>> {
    const response = await api.patch<ApiResponse<LogicRule>>(`/logic-rules/${rule_id}`, payload);
    return response.data;
  },
  async deleteLogicRule(rule_id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await api.delete<ApiResponse<{ id: number }>>(`/logic-rules/${rule_id}`);
    return response.data;
  },
  async reorderLogicRules(
    form_id: number,
    payload: ReorderLogicRulesPayload,
  ): Promise<ApiResponse<ReorderLogicRulesPayload & { form_id: number }>> {
    const response = await api.patch<ApiResponse<ReorderLogicRulesPayload & { form_id: number }>>(
      `/forms/${form_id}/logic-rules/reorder`,
      payload,
    );
    return response.data;
  },
};

const logicRulesApi = env.use_mock_api ? logicRulesMockApi : logicRulesAxiosApi;

export const {
  createLogicRule,
  deleteLogicRule,
  getLogicRules,
  reorderLogicRules,
  updateLogicRule,
} = logicRulesApi;
