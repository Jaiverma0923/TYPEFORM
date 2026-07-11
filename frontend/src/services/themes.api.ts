import { env } from "@/lib/env";
import { themesMockApi } from "@/mocks/themes.mock";
import type { ApiResponse } from "@/types/common";
import type { FormTheme, UpdateThemePayload } from "@/types/theme";

import { api } from "./api";

const themesAxiosApi = {
  async getTheme(form_id: number): Promise<ApiResponse<FormTheme>> {
    const response = await api.get<ApiResponse<FormTheme>>(`/forms/${form_id}/theme`);
    return response.data;
  },
  async updateTheme(
    form_id: number,
    payload: UpdateThemePayload,
  ): Promise<ApiResponse<FormTheme>> {
    const response = await api.patch<ApiResponse<FormTheme>>(`/forms/${form_id}/theme`, payload);
    return response.data;
  },
  async resetTheme(form_id: number): Promise<ApiResponse<FormTheme>> {
    const response = await api.post<ApiResponse<FormTheme>>(`/forms/${form_id}/theme/reset`);
    return response.data;
  },
};

const themesApi = env.use_mock_api ? themesMockApi : themesAxiosApi;

export const { getTheme, resetTheme, updateTheme } = themesApi;
