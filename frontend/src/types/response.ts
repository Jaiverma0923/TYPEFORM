import type { QuestionType } from "./question";

export type AnswerValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface ResponseAnswer {
  question_id: number;
  value: AnswerValue;
}

export interface FormResponse {
  id: number;
  form_id: number;
  answers: ResponseAnswer[];
  submitted_at: string;
  completion_time_seconds: number | null;
}

export interface SubmitResponsePayload {
  answers: ResponseAnswer[];
  completion_time_seconds?: number;
  form_version?: number;
}

export interface ResponsePreviewAnswer {
  question_id: number;
  question_title: string;
  value: AnswerValue;
}

export interface FormResponseSummary {
  id: number;
  submitted_at: string;
  completion_time_seconds: number | null;
  answer_count: number;
  preview: ResponsePreviewAnswer[];
}

export interface FormResponsesData {
  form: {
    id: number;
    title: string;
  };
  items: FormResponseSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ResponseDetailAnswer {
  question_id: number;
  question_title: string;
  question_type: QuestionType;
  value: AnswerValue;
}

export interface FormResponseDetail {
  id: number;
  form: {
    id: number;
    title: string;
  };
  submitted_at: string;
  completion_time_seconds: number | null;
  answers: ResponseDetailAnswer[];
}

export interface CsvExportResult {
  blob: Blob;
  filename: string;
}

export interface SubmitResponseResult {
  response_id: number;
  submitted_at: string;

  thank_you: {
    title: string;
    message: string;
  };
}
