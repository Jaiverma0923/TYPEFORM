import { findStoredForm, replaceStoredForm } from "./forms.store.ts";
import { mockResponse } from "./helpers.ts";
import {
  findStoredResponse,
  getStoredResponseCountForForm,
  getStoredResponses,
} from "./responses.store.ts";
import type { ApiResponse } from "@/types/common";
import type {
  CsvExportResult,
  FormResponse,
  FormResponseDetail,
  FormResponsesData,
  ResponseDetailAnswer,
  ResponsePreviewAnswer,
} from "@/types/response";
import { buildResponsesCsv, getCsvFilename } from "../features/responses/utils/csv.ts";

function getQuestionMetadata(form_id: number) {
  const form = findStoredForm(form_id);
  return {
    form,
    questionById: new Map(form.questions.map((question) => [question.id, question])),
  };
}

function sortAnswersByQuestionPosition(response: FormResponse) {
  const { questionById } = getQuestionMetadata(response.form_id);

  return response.answers.toSorted((a, b) => {
    const questionA = questionById.get(a.question_id);
    const questionB = questionById.get(b.question_id);
    return (questionA?.position ?? 0) - (questionB?.position ?? 0);
  });
}

function isMeaningfulPreviewValue(value: FormResponse["answers"][number]["value"]) {
  if (value === null) {
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

function toPreviewAnswers(response: FormResponse): ResponsePreviewAnswer[] {
  const { questionById } = getQuestionMetadata(response.form_id);

  return sortAnswersByQuestionPosition(response)
    .filter((answer) => isMeaningfulPreviewValue(answer.value))
    .slice(0, 3)
    .map((answer) => {
      const question = questionById.get(answer.question_id);

      return {
        question_id: answer.question_id,
        question_title: question?.title ?? "Deleted question",
        value: answer.value,
      };
    });
}

function toDetailAnswers(response: FormResponse): ResponseDetailAnswer[] {
  const { questionById } = getQuestionMetadata(response.form_id);

  return sortAnswersByQuestionPosition(response).map((answer) => {
    const question = questionById.get(answer.question_id);

    return {
      question_id: answer.question_id,
      question_title: question?.title ?? "Deleted question",
      question_type: question?.type ?? "short_text",
      value: answer.value,
    };
  });
}

export const responsesMockApi = {
  async getResponses(form_id: number): Promise<ApiResponse<FormResponsesData>> {
    const form = findStoredForm(form_id);
    const items = getStoredResponses()
      .filter((response) => response.form_id === form_id)
      .toSorted(
        (a, b) => {
          const submittedDiff =
            new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();

          return submittedDiff === 0 ? b.id - a.id : submittedDiff;
        },
      )
      .map((response) => ({
        id: response.id,
        submitted_at: response.submitted_at,
        completion_time_seconds: response.completion_time_seconds,
        answer_count: response.answers.length,
        preview: toPreviewAnswers(response),
      }));

    replaceStoredForm(form_id, (item) => ({
      ...item,
      response_count: getStoredResponseCountForForm(form_id),
    }));

    return mockResponse("Responses loaded.", {
      form: {
        id: form.id,
        title: form.title,
      },
      items,
      pagination: {
        page: 1,
        limit: 20,
        total: items.length,
        total_pages: 1,
      },
    });
  },
  async getResponse(response_id: number): Promise<ApiResponse<FormResponseDetail>> {
    const response = findStoredResponse(response_id);
    const { form } = getQuestionMetadata(response.form_id);

    return mockResponse("Response loaded.", {
      id: response.id,
      form: {
        id: form.id,
        title: form.title,
      },
      submitted_at: response.submitted_at,
      completion_time_seconds: response.completion_time_seconds,
      answers: toDetailAnswers(response),
    });
  },
  async exportResponsesCsv(form_id: number): Promise<CsvExportResult> {
    const form = findStoredForm(form_id);
    const responses = getStoredResponses()
      .filter((response) => response.form_id === form_id)
      .toSorted((a, b) => {
        const submittedDiff =
          new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();

        return submittedDiff === 0 ? b.id - a.id : submittedDiff;
      });

    const csv = buildResponsesCsv({
      form_title: form.title,
      questions: form.questions,
      responses,
    });

    return {
      blob: new Blob([csv], { type: "text/csv;charset=utf-8" }),
      filename: getCsvFilename(form.title),
    };
  },
};
