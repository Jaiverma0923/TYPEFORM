import { env } from "@/lib/env";
import { draftsMockApi } from "@/mocks/drafts.mock";
import type { ApiResponse } from "@/types/common";
import type { DraftResponse, UpdateDraftPayload } from "@/types/draft";

import { api } from "./api";

const draftsAxiosApi = {
  async getDraft(slug: string): Promise<ApiResponse<DraftResponse | null>> {
    const response = await api.get<ApiResponse<DraftResponse | null>>(`/public/${slug}/draft`);
    return response.data;
  },
  async createDraft(slug: string): Promise<ApiResponse<DraftResponse>> {
    const response = await api.post<ApiResponse<DraftResponse>>(`/public/${slug}/draft`);
    return response.data;
  },
  async updateDraft(
    draft_id: number,
    payload: UpdateDraftPayload,
  ): Promise<ApiResponse<DraftResponse>> {
    const response = await api.patch<ApiResponse<DraftResponse>>(`/drafts/${draft_id}`, payload);
    return response.data;
  },
  async deleteDraft(draft_id: number): Promise<ApiResponse<{ id: number }>> {
    const response = await api.delete<ApiResponse<{ id: number }>>(`/drafts/${draft_id}`);
    return response.data;
  },
};

const draftsApi = env.use_mock_api ? draftsMockApi : draftsAxiosApi;

export const { createDraft, deleteDraft, getDraft, updateDraft } = draftsApi;
