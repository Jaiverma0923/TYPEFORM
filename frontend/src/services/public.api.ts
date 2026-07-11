import { env } from "@/lib/env";
import { publicMockApi } from "@/mocks/public.mock";
import type { ApiResponse } from "@/types/common";
import type { PublicForm } from "@/types/form";
import type { SubmitResponsePayload, SubmitResponseResult, } from "@/types/response";

import { api } from "./api";

const publicAxiosApi = {
  async getPublicForm(slug: string): Promise<ApiResponse<PublicForm>> {
    const response = await api.get<ApiResponse<PublicForm>>(`/public/forms/${slug}`);
    return response.data;
  },
  async submitResponse(
    slug: string,
    payload: SubmitResponsePayload,
  ): Promise<ApiResponse<SubmitResponseResult>> {
    const response = await api.post<ApiResponse<SubmitResponseResult>>(
      `/public/forms/${slug}/responses`,
      payload,
    );
    return response.data;
  }
};

const publicApi = env.use_mock_api ? publicMockApi : publicAxiosApi;

export const { getPublicForm, submitResponse } = publicApi;
