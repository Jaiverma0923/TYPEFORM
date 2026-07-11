import { mockPaginatedResponse, mockResponse, shouldFailMock } from "./helpers.ts";
import {
  cloneForm,
  findStoredForm,
  getStoredForms,
  prependStoredForm,
  removeStoredForm,
  replaceStoredForm,
} from "./forms.store.ts";
import type { ApiResponse, PaginatedData } from "@/types/common";
import type { CreateFormPayload, Form, UpdateFormPayload } from "@/types/form";
import { createThemeFromPreset } from "../features/theme/themePresets.ts";
import { createNumericId } from "./mockIds.ts";
import { removeResponsesForForm } from "./responses.store.ts";
import { removeStoredDraftsForForm } from "./drafts.store.ts";
import { validateLogicRules } from "../features/logic/rules.ts";

function createSlug(title: string, id: number) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${base || "untitled-form"}-${id}`;
}

function failIfRequested(operation: string) {
  if (shouldFailMock(operation)) {
    throw new Error("Mock request failed.");
  }
}

export const formsMockApi = {
  createForm(payload: CreateFormPayload): Promise<ApiResponse<Form>> {
    failIfRequested("createForm");

    const created_at = new Date().toISOString();
    const id = createNumericId(getStoredForms().map((form) => form.id));
    const form: Form = {
      id,
      title: payload.title,
      description: payload.description,
      slug: "",
      status: "draft",
      version: 1,
      question_count: 0,
      response_count: 0,
      thank_you_title: payload.thank_you_title ?? "Thank you",
      thank_you_message:
        payload.thank_you_message ?? "Your response has been recorded.",
      questions: [],
      logic_rules: [],
      theme: createThemeFromPreset("Classic Typeform", id, id),
      created_at,
      updated_at: created_at,
      published_at: null,
    };

    return mockResponse("Form created.", prependStoredForm(form));
  },
  getForms(): Promise<ApiResponse<PaginatedData<Form>>> {
    failIfRequested("getForms");

    return mockPaginatedResponse("Forms loaded.", getStoredForms());
  },
  getForm(form_id: number): Promise<ApiResponse<Form>> {
    failIfRequested("getForm");

    const form = cloneForm(findStoredForm(form_id));
    return mockResponse("Form loaded.", {
      ...form,
      questions: form.questions.toSorted((a, b) => a.position - b.position),
    });
  },
  updateForm(form_id: number, payload: UpdateFormPayload): Promise<ApiResponse<Form>> {
    failIfRequested("updateForm");

    const updated_at = new Date().toISOString();
    const updatedForm = replaceStoredForm(form_id, (item) => ({
        ...item,
        ...payload,
        version: item.version + 1,
        updated_at,
    }));

    return mockResponse("Form updated.", cloneForm(updatedForm));
  },
  deleteForm(form_id: number): Promise<ApiResponse<{ id: number }>> {
    failIfRequested("deleteForm");

    removeStoredForm(form_id);
    removeResponsesForForm(form_id);
    removeStoredDraftsForForm(form_id);

    return mockResponse("Form deleted.", { id: form_id });
  },
  duplicateForm(form_id: number): Promise<ApiResponse<Form>> {
    failIfRequested("duplicateForm");

    const form = findStoredForm(form_id);
    const created_at = new Date().toISOString();
    const id = createNumericId(getStoredForms().map((item) => item.id));
    const nextQuestionIdStart = createNumericId(
      getStoredForms().flatMap((item) => item.questions.map((question) => question.id)),
    );
    const nextRuleIdStart = createNumericId(
      getStoredForms().flatMap((item) => item.logic_rules.map((rule) => rule.id)),
    );
    const questionIdMap = new Map(
      form.questions.map((question, index) => [question.id, nextQuestionIdStart + index]),
    );
    const duplicatedForm: Form = {
      ...cloneForm(form),
      id,
      title: `${form.title} copy`,
      slug: "",
      status: "draft",
      version: 1,
      response_count: 0,
      created_at,
      updated_at: created_at,
      published_at: null,
      public_url: undefined,
      theme: {
        ...cloneForm(form).theme,
        id,
        form_id: id,
        created_at,
        updated_at: created_at,
      },
      questions: form.questions.map((question, index) => ({
        ...question,
        id: nextQuestionIdStart + index,
        form_id: id,
        position: index,
        created_at,
        updated_at: created_at,
      })),
      logic_rules: form.logic_rules.flatMap((rule, index) => {
        const source_question_id = questionIdMap.get(rule.source_question_id);
        const target_question_id =
          rule.target_question_id === null ? null : questionIdMap.get(rule.target_question_id);

        if (!source_question_id || (rule.target_question_id !== null && !target_question_id)) {
          return [];
        }

        return [
          {
            ...rule,
            id: nextRuleIdStart + index,
            form_id: id,
            source_question_id,
            target_question_id: target_question_id ?? null,
            priority: index,
            created_at,
            updated_at: created_at,
          },
        ];
      }),
    };

    return mockResponse("Form duplicated.", prependStoredForm(duplicatedForm));
  },
  publishForm(form_id: number): Promise<ApiResponse<Form>> {
    failIfRequested("publishForm");

    const published_at = new Date().toISOString();
    const form = findStoredForm(form_id);
    const invalidRule = validateLogicRules(form.logic_rules, form.questions).find(
      (result) => !result.valid,
    );

    if (invalidRule) {
      throw new Error("Fix invalid logic rules before publishing.");
    }

    const publishedForm = replaceStoredForm(form_id, (item) => ({
        ...item,
        slug: item.slug || createSlug(item.title, item.id),
        status: "published",
        version: item.version + 1,
        updated_at: published_at,
        published_at,
    }));

    return mockResponse("Form published.", cloneForm(publishedForm));
  },
  unpublishForm(form_id: number): Promise<ApiResponse<Form>> {
    failIfRequested("unpublishForm");

    const updated_at = new Date().toISOString();
    const unpublishedForm = replaceStoredForm(form_id, (item) => ({
        ...item,
        status: "draft",
        version: item.version + 1,
        updated_at,
        published_at: null,
        public_url: undefined,
    }));

    return mockResponse("Form unpublished.", cloneForm(unpublishedForm));
  },
};
