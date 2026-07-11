import type { QuestionType } from "./question";

export interface ChoiceAnalyticsCount {
  label: string;
  count: number;
  percentage: number;
}

export interface ChoiceAnalyticsSummary {
  counts: ChoiceAnalyticsCount[];
}

export interface RatingDistributionItem {
  value: number;
  count: number;
}

export interface RatingAnalyticsSummary {
  average: number | null;
  distribution: RatingDistributionItem[];
}

export interface YesNoAnalyticsSummary {
  yes: number;
  no: number;
}

export type QuestionAnalyticsSummary =
  | ChoiceAnalyticsSummary
  | RatingAnalyticsSummary
  | YesNoAnalyticsSummary
  | null;

export interface QuestionAnalytics {
  question_id: number;
  title: string;
  type: QuestionType;
  answered_count: number;
  skipped_count: number;
  summary: QuestionAnalyticsSummary;
}

export interface FormAnalytics {
  form_id: number;
  form_title: string;
  total_responses: number;
  started_responses: number;
  completed_responses: number;
  average_completion_time_seconds: number | null;
  questions: QuestionAnalytics[];
}
