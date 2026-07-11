import type { AnswerValue } from "./response";

export interface DraftAnswer {
  question_id: number;
  value: AnswerValue;
}

export interface DraftResponse {
  id: number;
  form_id: number;
  slug: string;
  form_version: number;
  answers: DraftAnswer[];
  current_question_id: number;
  visited_question_ids: number[];
  started_at: string;
  last_saved_at: string;
  completed: boolean;
}

export interface UpdateDraftPayload {
  form_version: number;
  answers: DraftAnswer[];
  current_question_id: number;
  visited_question_ids: number[];
  started_at: string;
  completed?: boolean;
}
