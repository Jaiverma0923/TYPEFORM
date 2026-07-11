import { env } from "@/lib/env";
import { questionsMockApi } from "@/mocks/questions.mock";
import type { ApiResponse } from "@/types/common";
import type {
  CreateQuestionPayload,
  Question,
  ReorderQuestionsPayload,
  UpdateQuestionPayload,
} from "@/types/question";

import { api } from "./api";

const questionsAxiosApi = {
  async createQuestion(
    form_id: number,
    payload: CreateQuestionPayload,
  ): Promise<ApiResponse<Question>> {
    const response = await api.post<ApiResponse<Question>>(
      `/forms/${form_id}/questions`,
      payload,
    );
    return response.data;
  },
  async updateQuestion(
    question_id: number,
    payload: UpdateQuestionPayload,
  ): Promise<ApiResponse<Question>> {
    const response = await api.patch<ApiResponse<Question>>(
      `/questions/${question_id}`,
      payload,
    );
    return response.data;
  },
  async deleteQuestion(question_id: number): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `/questions/${question_id}`,
    );
    return response.data;
  },
  async reorderQuestions(
    form_id: number,
    payload: ReorderQuestionsPayload,
  ): Promise<ApiResponse<ReorderQuestionsPayload & { form_id: number }>> {
    const response = await api.patch<
      ApiResponse<ReorderQuestionsPayload & { form_id: number }>
    >(`/forms/${form_id}/questions/reorder`, payload);
    return response.data;
  },
};

const questionsApi = env.use_mock_api ? questionsMockApi : questionsAxiosApi;

export const {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} = questionsApi;
