import { getStoredForms, replaceStoredForm } from "./forms.store.ts";
import { mockResponse } from "./helpers.ts";
import {
  addStoredResponse,
  getStoredResponseCountForForm,
} from "./responses.store.ts";
import type { ApiResponse } from "@/types/common";
import type { Form } from "@/types/form";
import type { FormResponse, SubmitResponsePayload } from "@/types/response";

export const publicMockApi = {
  async getPublicForm(slug: string): Promise<ApiResponse<Form>> {
    const form = getStoredForms().find(
      (item) => item.slug === slug && item.status === "published",
    );

    if (!form) {
      throw new Error("Form not found.");
    }

    return mockResponse("Public form loaded.", {
      ...form,
      questions: form.questions.toSorted((a, b) => a.position - b.position),
    });
  },
  async submitResponse(
    slug: string,
    payload: SubmitResponsePayload,
  ): Promise<ApiResponse<FormResponse>> {
    const form = getStoredForms().find(
      (item) => item.slug === slug && item.status === "published",
    );

    if (!form) {
      throw new Error("Form not found.");
    }

    const submitted_at = new Date().toISOString();
    const response: FormResponse = addStoredResponse({
      form_id: form.id,
      answers: payload.answers,
      submitted_at,
      completion_time_seconds: payload.completion_time_seconds ?? null,
    });

    replaceStoredForm(form.id, (item) => ({
      ...item,
      response_count: getStoredResponseCountForForm(item.id),
      updated_at: submitted_at,
    }));

    return mockResponse("Response submitted.", response);
  },
};
