export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionSettings {
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface Question {
  id: number;
  form_id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  settings: QuestionSettings;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionPayload {
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  position: number;
  settings: QuestionSettings;
}

export interface UpdateQuestionPayload {
  type?: QuestionType;
  title?: string;
  description?: string | null;
  required?: boolean;
  position?: number;
  settings?: QuestionSettings;
}

export interface ReorderQuestionsPayload {
  question_ids: number[];
}
