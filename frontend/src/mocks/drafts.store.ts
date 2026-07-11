import type { DraftAnswer, DraftResponse } from "@/types/draft";
import type { AnswerValue } from "@/types/response";

import { createNumericId } from "./mockIds.ts";

let drafts: DraftResponse[] = [];

function cloneAnswerValue(value: AnswerValue): AnswerValue {
  if (Array.isArray(value)) {
    return [...value];
  }

  return value;
}

export function cloneDraftAnswer(answer: DraftAnswer): DraftAnswer {
  return {
    ...answer,
    value: cloneAnswerValue(answer.value),
  };
}

export function cloneDraft(draft: DraftResponse): DraftResponse {
  return {
    ...draft,
    answers: draft.answers.map(cloneDraftAnswer),
    visited_question_ids: [...draft.visited_question_ids],
  };
}

export function getStoredDrafts() {
  return drafts.map(cloneDraft);
}

export function findStoredDraftBySlug(slug: string) {
  const draft = drafts.find((item) => item.slug === slug && !item.completed);
  return draft ? cloneDraft(draft) : null;
}

export function findStoredDraft(draft_id: number) {
  const draft = drafts.find((item) => item.id === draft_id);

  if (!draft) {
    throw new Error("Draft not found.");
  }

  return cloneDraft(draft);
}

export function upsertStoredDraft(draft: Omit<DraftResponse, "id"> & { id?: number }) {
  const storedDraft: DraftResponse = cloneDraft({
    ...draft,
    id: draft.id ?? createNumericId(drafts.map((item) => item.id)),
  });
  const existingIndex = drafts.findIndex((item) => item.id === storedDraft.id);

  if (existingIndex >= 0) {
    drafts = drafts.map((item) => (item.id === storedDraft.id ? storedDraft : item));
  } else {
    drafts = [...drafts, storedDraft];
  }

  return cloneDraft(storedDraft);
}

export function removeStoredDraft(draft_id: number) {
  findStoredDraft(draft_id);
  drafts = drafts.filter((draft) => draft.id !== draft_id);
}

export function removeStoredDraftsForForm(form_id: number) {
  drafts = drafts.filter((draft) => draft.form_id !== form_id);
}

export function resetStoredDraftsForTests() {
  drafts = [];
}
