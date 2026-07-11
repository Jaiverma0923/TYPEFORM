import { z } from "zod";

export const responseAnswerSchema = z.object({
  question_id: z.number().int().positive(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.null(),
  ]),
});

export const formResponseSchema = z.object({
  id: z.number().int().positive(),
  form_id: z.number().int().positive(),
  answers: z.array(responseAnswerSchema),
  submitted_at: z.string(),
  completion_time_seconds: z.number().int().nonnegative().nullable(),
});

export const submitResponseSchema = z.object({
  answers: z.array(responseAnswerSchema),
  completion_time_seconds: z.number().int().nonnegative().optional(),
  form_version: z.number().int().positive().optional(),
});
