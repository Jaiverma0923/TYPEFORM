import { z } from "zod";

import { responseAnswerSchema } from "./response.schema";

export const draftAnswerSchema = responseAnswerSchema;

export const draftResponseSchema = z.object({
  id: z.number().int().positive(),
  form_id: z.number().int().positive(),
  slug: z.string(),
  form_version: z.number().int().positive(),
  answers: z.array(draftAnswerSchema),
  current_question_id: z.number().int().positive(),
  visited_question_ids: z.array(z.number().int().positive()),
  started_at: z.string(),
  last_saved_at: z.string(),
  completed: z.boolean(),
});

export const updateDraftSchema = z.object({
  form_version: z.number().int().positive(),
  answers: z.array(draftAnswerSchema),
  current_question_id: z.number().int().positive(),
  visited_question_ids: z.array(z.number().int().positive()),
  started_at: z.string(),
  completed: z.boolean().optional(),
});
