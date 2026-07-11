import {
  AlignLeft,
  CheckCircle2,
  ChevronDownSquare,
  Hash,
  ListChecks,
  Mail,
  MessageSquareText,
  SlidersHorizontal,
} from "lucide-react";

import type {
  CreateQuestionPayload,
  Question,
  QuestionSettings,
  QuestionType,
  UpdateQuestionPayload,
} from "@/types/question";

export const questionTypeOptions: Array<{
  type: QuestionType;
  label: string;
  description: string;
  Icon: typeof MessageSquareText;
}> = [
  {
    type: "short_text",
    label: "Short text",
    description: "A single-line answer.",
    Icon: MessageSquareText,
  },
  {
    type: "long_text",
    label: "Long text",
    description: "A longer written response.",
    Icon: AlignLeft,
  },
  {
    type: "multiple_choice",
    label: "Multiple choice",
    description: "A list of selectable choices.",
    Icon: ListChecks,
  },
  {
    type: "dropdown",
    label: "Dropdown",
    description: "A compact choice list.",
    Icon: ChevronDownSquare,
  },
  {
    type: "email",
    label: "Email",
    description: "An email address field.",
    Icon: Mail,
  },
  {
    type: "number",
    label: "Number",
    description: "A numeric answer.",
    Icon: Hash,
  },
  {
    type: "yes_no",
    label: "Yes / no",
    description: "A binary choice.",
    Icon: CheckCircle2,
  },
  {
    type: "rating",
    label: "Rating",
    description: "A numeric rating range.",
    Icon: SlidersHorizontal,
  },
];

export function getQuestionTypeLabel(type: QuestionType) {
  return questionTypeOptions.find((option) => option.type === type)?.label ?? type;
}

export function getDefaultSettings(type: QuestionType): QuestionSettings {
  if (type === "multiple_choice" || type === "dropdown") {
    return { options: ["Option 1", "Option 2"] };
  }

  if (type === "rating") {
    return { min: 1, max: 5 };
  }

  if (type === "yes_no") {
    return {};
  }

  return { placeholder: "Type your answer" };
}

export function createDefaultQuestionPayload(
  type: QuestionType,
  position: number,
): CreateQuestionPayload {
  return {
    type,
    title: "Untitled question",
    description: null,
    required: false,
    position,
    settings: getDefaultSettings(type),
  };
}

export function normalizeSettingsForType(
  type: QuestionType,
  settings: QuestionSettings,
): QuestionSettings {
  if (type === "multiple_choice" || type === "dropdown") {
    const options = settings.options?.map((option) => option.trim()).filter(Boolean);
    return { options: options && options.length > 0 ? options : ["Option 1"] };
  }

  if (type === "rating") {
    return {
      min: settings.min ?? 1,
      max: settings.max ?? 5,
    };
  }

  if (type === "yes_no") {
    return {};
  }

  return {
    placeholder: settings.placeholder ?? "Type your answer",
  };
}

export function sanitizeQuestionPayload(
  question: Question,
  values: UpdateQuestionPayload,
): UpdateQuestionPayload {
  const type = values.type ?? question.type;

  return {
    type,
    title: values.title?.trim() ?? question.title,
    description: values.description === "" ? null : values.description,
    required: values.required ?? question.required,
    settings: normalizeSettingsForType(type, values.settings ?? question.settings),
  };
}

export function questionsAreEqual(question: Question, payload: UpdateQuestionPayload) {
  return (
    question.type === payload.type &&
    question.title === payload.title &&
    question.description === payload.description &&
    question.required === payload.required &&
    JSON.stringify(question.settings) === JSON.stringify(payload.settings)
  );
}
