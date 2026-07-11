import { findStoredForm } from "./forms.store.ts";
import { getStoredDrafts } from "./drafts.store.ts";
import { mockResponse } from "./helpers.ts";
import { getStoredResponses } from "./responses.store.ts";
import type { ApiResponse } from "@/types/common";
import type {
  ChoiceAnalyticsSummary,
  FormAnalytics,
  QuestionAnalyticsSummary,
  RatingAnalyticsSummary,
  YesNoAnalyticsSummary,
} from "@/types/analytics";
import type { Question } from "@/types/question";
import type { AnswerValue, FormResponse } from "@/types/response";

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function isMeaningfulAnswer(value: AnswerValue | undefined) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

function getAnswerByQuestionId(response: FormResponse, question_id: number) {
  return response.answers.find((answer) => answer.question_id === question_id)?.value;
}

function getChoiceSummary(
  question: Question,
  responses: FormResponse[],
  answeredCount: number,
): ChoiceAnalyticsSummary {
  const options = question.settings.options ?? [];

  return {
    counts: options.map((option) => {
      const count = responses.filter(
        (response) => getAnswerByQuestionId(response, question.id) === option,
      ).length;

      return {
        label: option,
        count,
        percentage: answeredCount === 0 ? 0 : roundToTwo((count / answeredCount) * 100),
      };
    }),
  };
}

function getRatingSummary(
  question: Question,
  responses: FormResponse[],
): RatingAnalyticsSummary {
  const min = question.settings.min ?? 1;
  const max = question.settings.max ?? 5;
  const values = responses
    .map((response) => getAnswerByQuestionId(response, question.id))
    .filter((value): value is number => typeof value === "number");

  const average =
    values.length === 0
      ? null
      : roundToTwo(values.reduce((total, value) => total + value, 0) / values.length);

  return {
    average,
    distribution: Array.from({ length: max - min + 1 }, (_, index) => {
      const value = min + index;

      return {
        value,
        count: values.filter((rating) => rating === value).length,
      };
    }),
  };
}

function getYesNoSummary(
  question: Question,
  responses: FormResponse[],
): YesNoAnalyticsSummary {
  let yes = 0;
  let no = 0;

  for (const response of responses) {
    const value = getAnswerByQuestionId(response, question.id);

    if (value === true) {
      yes += 1;
    }

    if (value === false) {
      no += 1;
    }
  }

  return { yes, no };
}

function getQuestionSummary(
  question: Question,
  responses: FormResponse[],
  answeredCount: number,
): QuestionAnalyticsSummary {
  if (question.type === "multiple_choice" || question.type === "dropdown") {
    return getChoiceSummary(question, responses, answeredCount);
  }

  if (question.type === "rating") {
    return getRatingSummary(question, responses);
  }

  if (question.type === "yes_no") {
    return getYesNoSummary(question, responses);
  }

  return null;
}

export const analyticsMockApi = {
  async getAnalytics(form_id: number): Promise<ApiResponse<FormAnalytics>> {
    const form = findStoredForm(form_id);
    const questions = form.questions.toSorted((a, b) => a.position - b.position);
    const responses = getStoredResponses().filter(
      (response) => response.form_id === form_id,
    );
    const activeDrafts = getStoredDrafts().filter(
      (draft) => draft.form_id === form_id && !draft.completed,
    );
    const completionTimes = responses
      .map((response) => response.completion_time_seconds)
      .filter((value): value is number => value !== null);
    const average_completion_time_seconds =
      completionTimes.length === 0
        ? null
        : roundToTwo(
            completionTimes.reduce((total, value) => total + value, 0) /
              completionTimes.length,
          );

    return mockResponse("Analytics fetched successfully", {
      form_id: form.id,
      form_title: form.title,
      total_responses: responses.length,
      started_responses: responses.length + activeDrafts.length,
      completed_responses: responses.length,
      average_completion_time_seconds,
      questions: questions.map((question) => {
        const answered_count = responses.filter((response) =>
          isMeaningfulAnswer(getAnswerByQuestionId(response, question.id)),
        ).length;

        return {
          question_id: question.id,
          title: question.title,
          type: question.type,
          answered_count,
          skipped_count: responses.length - answered_count,
          summary: getQuestionSummary(question, responses, answered_count),
        };
      }),
    });
  },
};
