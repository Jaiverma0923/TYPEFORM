import { env } from "@/lib/env";
import { analyticsMockApi } from "@/mocks/analytics.mock";
import type { ApiResponse } from "@/types/common";
import type { FormAnalytics } from "@/types/analytics";

import { api } from "./api";

const analyticsAxiosApi = {
  async getAnalytics(form_id: number): Promise<ApiResponse<FormAnalytics>> {
    const response = await api.get<ApiResponse<FormAnalytics>>(
      `/forms/${form_id}/analytics`,
    );
    return response.data;
  },
};

const analyticsApi = env.use_mock_api ? analyticsMockApi : analyticsAxiosApi;

export const { getAnalytics } = analyticsApi;
