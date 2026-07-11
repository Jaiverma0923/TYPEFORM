import { env } from "@/lib/env";
import { formsMockApi } from "@/mocks/forms.mock";
import type { ApiResponse, PaginatedData } from "@/types/common";
import type { CreateFormPayload, Form, UpdateFormPayload } from "@/types/form";

import { api } from "./api";

const formsAxiosApi = {
  async createForm(payload: CreateFormPayload): Promise<ApiResponse<Form>> {
    const response = await api.post<ApiResponse<Form>>("/forms", payload);
    return response.data;
  },
  async getForms(): Promise<ApiResponse<PaginatedData<Form>>> {
    const response = await api.get<ApiResponse<PaginatedData<Form>>>("/forms");
    return response.data;
  },
  async getForm(form_id: number): Promise<ApiResponse<Form>> {
    const response = await api.get<ApiResponse<Form>>(`/forms/${form_id}`);
    return response.data;
  },
  async updateForm(
    form_id: number,
    payload: UpdateFormPayload,
  ): Promise<ApiResponse<Form>> {
    const response = await api.patch<ApiResponse<Form>>(`/forms/${form_id}`, payload);
    return response.data;
  },
  async deleteForm(form_id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/forms/${form_id}`,);
    return response.data;
  },
  async duplicateForm(form_id: number): Promise<ApiResponse<Form>> {
    const response = await api.post<ApiResponse<Form>>(`/forms/${form_id}/duplicate`);
    return response.data;
  },
  async publishForm(form_id: number): Promise<ApiResponse<Form>> {
    const response = await api.post<ApiResponse<Form>>(`/forms/${form_id}/publish`);
    return response.data;
  },
  async unpublishForm(form_id: number): Promise<ApiResponse<Form>> {
    const response = await api.post<ApiResponse<Form>>(`/forms/${form_id}/unpublish`);
    return response.data;
  },
};

const formsApi = env.use_mock_api ? formsMockApi : formsAxiosApi;

export const {
  createForm,
  getForms,
  getForm,
  updateForm,
  deleteForm,
  duplicateForm,
  publishForm,
  unpublishForm,
} = formsApi;
