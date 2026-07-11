import { mockResponse, shouldFailMock } from "./helpers.ts";
import {
  cloneQuestion,
  findAllStoredQuestions,
  findStoredForm,
  findStoredQuestion,
  normalizeLogicRules,
  normalizeQuestions,
  replaceStoredForm,
} from "./forms.store.ts";
import type { ApiResponse } from "@/types/common";
import type {
  CreateQuestionPayload,
  Question,
  ReorderQuestionsPayload,
  UpdateQuestionPayload,
} from "@/types/question";
import { createNumericId } from "./mockIds.ts";

function failIfRequested(operation: string) {
  if (shouldFailMock(operation)) {
    throw new Error("Mock request failed.");
  }
}

function getAllQuestionIds() {
  return findAllStoredQuestions().map((question) => question.id);
}

export const questionsMockApi = {
  createQuestion(
    form_id: number,
    payload: CreateQuestionPayload,
  ): Promise<ApiResponse<Question>> {
    failIfRequested("createQuestion");

    const created_at = new Date().toISOString();
    const form = findStoredForm(form_id);
    const question: Question = {
      id: createNumericId(
        getAllQuestionIds(),
      ),
      form_id,
      ...payload,
      position: payload.position ?? form.questions.length,
      version: 1,
      created_at,
      updated_at: created_at,
    };

    const updatedForm = replaceStoredForm(form_id, (item) => {
      const questions = normalizeQuestions([...item.questions, question]);

      return {
        ...item,
        questions,
        question_count: questions.length,
        version: item.version + 1,
        updated_at: created_at,
      };
    });

    const createdQuestion = updatedForm.questions.find((item) => item.id === question.id);

    if (!createdQuestion) {
      throw new Error("Question could not be created.");
    }

    return mockResponse("Question created.", createdQuestion);
  },
  updateQuestion(
    question_id: number,
    payload: UpdateQuestionPayload,
  ): Promise<ApiResponse<Question>> {
    failIfRequested("updateQuestion");

    const { form, question } = findStoredQuestion(question_id);
    const updated_at = new Date().toISOString();
    let updatedQuestion: Question = question;

    replaceStoredForm(form.id, (item) => ({
      ...item,
      version: item.version + 1,
      updated_at,
      questions: item.questions.map((currentQuestion) => {
        if (currentQuestion.id !== question_id) {
          return currentQuestion;
        }

        updatedQuestion = {
          ...currentQuestion,
          ...payload,
          position: currentQuestion.position,
          version: currentQuestion.version + 1,
          updated_at,
        };

        return updatedQuestion;
      }),
    }));

    return mockResponse("Question updated.", cloneQuestion(updatedQuestion));
  },
  deleteQuestion(question_id: number): Promise<ApiResponse<{ id: number }>> {
    failIfRequested("deleteQuestion");

    const { form } = findStoredQuestion(question_id);
    const updated_at = new Date().toISOString();

    replaceStoredForm(form.id, (item) => {
      const questions = normalizeQuestions(
        item.questions.filter((question) => question.id !== question_id),
      );
      const logic_rules = normalizeLogicRules(
        item.logic_rules.filter(
          (rule) =>
            rule.source_question_id !== question_id && rule.target_question_id !== question_id,
        ),
      );

      return {
        ...item,
        questions,
        logic_rules,
        question_count: questions.length,
        version: item.version + 1,
        updated_at,
      };
    });

    return mockResponse("Question deleted.", { id: question_id });
  },
  reorderQuestions(
    form_id: number,
    payload: ReorderQuestionsPayload,
  ): Promise<ApiResponse<ReorderQuestionsPayload & { form_id: number }>> {
    failIfRequested("reorderQuestions");

    const form = findStoredForm(form_id);
    const existingIds = new Set(form.questions.map((question) => question.id));
    const uniqueIds = new Set(payload.question_ids);

    if (
      uniqueIds.size !== form.questions.length ||
      payload.question_ids.some((question_id) => !existingIds.has(question_id))
    ) {
      throw new Error("Question order is invalid.");
    }

    const updated_at = new Date().toISOString();

    replaceStoredForm(form_id, (item) => {
      const questionById = new Map(item.questions.map((question) => [question.id, question]));
      const questions = payload.question_ids.map((question_id, index) => {
        const question = questionById.get(question_id);

        if (!question) {
          throw new Error("Question order is invalid.");
        }

        return {
          ...question,
          position: index,
          updated_at,
        };
      });

      return {
        ...item,
        questions,
        version: item.version + 1,
        updated_at,
      };
    });

    return mockResponse("Questions reordered.", {
      form_id,
      question_ids: payload.question_ids,
    });
  },
};
