import type { LogicRule } from "./logic";
import type { Question } from "./question";
import type { FormTheme } from "./theme";

export type FormStatus = "draft" | "published";

export interface Form {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  status: FormStatus;
  version: number;
  question_count: number;
  response_count: number;
  thank_you_title: string;
  thank_you_message: string;
  questions: Question[];
  logic_rules: LogicRule[];
  theme: FormTheme;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  public_url?: string;
}

export interface CreateFormPayload {
  title: string;
  description: string | null;
  thank_you_title?: string;
  thank_you_message?: string;
}

export interface UpdateFormPayload {
  title?: string;
  description?: string | null;
  thank_you_title?: string;
  thank_you_message?: string;
}

export interface FormSummary {
  id: number;
  title: string;
  description: string | null;
  slug: string | null;
  status: "draft" | "published";
  version: number;
  question_count: number;
  response_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface PublicForm {
  id: number;
  title: string;
  description: string | null;
  slug: string;

  version: number;

  thank_you_title: string;
  thank_you_message: string;

  questions: Question[];
  logic_rules: LogicRule[];
  theme: FormTheme;
}