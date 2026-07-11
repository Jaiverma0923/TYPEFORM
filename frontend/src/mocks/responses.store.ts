import { mockResponses } from "./data.ts";
import { createNumericId } from "./mockIds.ts";
import type { AnswerValue, FormResponse } from "@/types/response";

function cloneAnswerValue(value: AnswerValue): AnswerValue {
  if (Array.isArray(value)) {
    return [...value];
  }

  return value;
}

let responses: FormResponse[] = mockResponses.map(cloneResponse);

export function cloneResponse(response: FormResponse): FormResponse {
  return {
    ...response,
    answers: response.answers.map((answer) => ({
      ...answer,
      value: cloneAnswerValue(answer.value),
    })),
  };
}

export function getStoredResponses() {
  return responses.map(cloneResponse);
}

export function getStoredResponseCountForForm(form_id: number) {
  return responses.filter((response) => response.form_id === form_id).length;
}

export function findStoredResponse(response_id: number) {
  const response = responses.find((item) => item.id === response_id);

  if (!response) {
    throw new Error("Response not found.");
  }

  return cloneResponse(response);
}

export function addStoredResponse(
  response: Omit<FormResponse, "id"> & { id?: number },
) {
  const storedResponse: FormResponse = {
    ...response,
    id: response.id ?? createNumericId(responses.map((item) => item.id)),
    completion_time_seconds: response.completion_time_seconds ?? null,
  };

  responses = [...responses, cloneResponse(storedResponse)];
  return cloneResponse(storedResponse);
}

export function removeResponsesForForm(form_id: number) {
  responses = responses.filter((response) => response.form_id !== form_id);
}

export function resetStoredResponsesForTests() {
  responses = mockResponses.map(cloneResponse);
}
