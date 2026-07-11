import type { ApiResponse } from "@/types/common";
import type { DraftResponse, UpdateDraftPayload } from "@/types/draft";

import { findStoredForm, getStoredForms } from "./forms.store.ts";
import { mockResponse, shouldFailMock } from "./helpers.ts";
import {
  findStoredDraft,
  findStoredDraftBySlug,
  removeStoredDraft,
  upsertStoredDraft,
} from "./drafts.store.ts";

function failIfRequested(operation: string) {
  if (shouldFailMock(operation)) {
    throw new Error("Mock request failed.");
  }
}

function getPublishedFormBySlug(slug: string) {
  const form = getStoredForms().find((item) => item.slug === slug && item.status === "published");

  if (!form) {
    throw new Error("Form not found.");
  }

  return form;
}

export const draftsMockApi = {
  getDraft(slug: string): Promise<ApiResponse<DraftResponse | null>> {
    failIfRequested("getDraft");
    getPublishedFormBySlug(slug);
    return mockResponse("Draft fetched.", findStoredDraftBySlug(slug));
  },

  createDraft(slug: string): Promise<ApiResponse<DraftResponse>> {
    failIfRequested("createDraft");
    const existing = findStoredDraftBySlug(slug);

    if (existing) {
      return mockResponse("Draft resumed.", existing);
    }

    const form = getPublishedFormBySlug(slug);
    const firstQuestion = form.questions.toSorted((a, b) => a.position - b.position)[0];

    if (!firstQuestion) {
      throw new Error("Cannot create a draft for a form with no questions.");
    }

    const now = new Date().toISOString();
    const draft = upsertStoredDraft({
      form_id: form.id,
      slug,
      form_version: form.version,
      answers: [],
      current_question_id: firstQuestion.id,
      visited_question_ids: [firstQuestion.id],
      started_at: now,
      last_saved_at: now,
      completed: false,
    });

    return mockResponse("Draft created.", draft);
  },

  updateDraft(draft_id: number, payload: UpdateDraftPayload): Promise<ApiResponse<DraftResponse>> {
    failIfRequested("updateDraft");
    const existing = findStoredDraft(draft_id);
    const form = findStoredForm(existing.form_id);
    const questionIds = new Set(form.questions.map((question) => question.id));

    if (!questionIds.has(payload.current_question_id)) {
      throw new Error("Current question is invalid.");
    }

    if (payload.visited_question_ids.some((question_id) => !questionIds.has(question_id))) {
      throw new Error("Visited question history is invalid.");
    }

    if (payload.answers.some((answer) => !questionIds.has(answer.question_id))) {
      throw new Error("Draft answer references an invalid question.");
    }

    const updated = upsertStoredDraft({
      ...existing,
      ...payload,
      last_saved_at: new Date().toISOString(),
      completed: payload.completed ?? existing.completed,
    });

    return mockResponse("Draft saved.", updated);
  },

  deleteDraft(draft_id: number): Promise<ApiResponse<{ id: number }>> {
    failIfRequested("deleteDraft");
    removeStoredDraft(draft_id);
    return mockResponse("Draft deleted.", { id: draft_id });
  },
};
