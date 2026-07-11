import { z } from "zod";

import { questionTypeSchema } from "./question.schema";

export const choiceAnalyticsCountSchema = z.object({
  label: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number().nonnegative(),
});

export const choiceAnalyticsSummarySchema = z.object({
  counts: z.array(choiceAnalyticsCountSchema),
});

export const ratingAnalyticsSummarySchema = z.object({
  average: z.number().nullable(),
  distribution: z.array(
    z.object({
      value: z.number().int(),
      count: z.number().int().nonnegative(),
    }),
  ),
});

export const yesNoAnalyticsSummarySchema = z.object({
  yes: z.number().int().nonnegative(),
  no: z.number().int().nonnegative(),
});

export const questionAnalyticsSchema = z.object({
  question_id: z.number().int().positive(),
  title: z.string(),
  type: questionTypeSchema,
  answered_count: z.number().int().nonnegative(),
  skipped_count: z.number().int().nonnegative(),
  summary: z.union([
    choiceAnalyticsSummarySchema,
    ratingAnalyticsSummarySchema,
    yesNoAnalyticsSummarySchema,
    z.null(),
  ]),
});

export const formAnalyticsSchema = z.object({
  form_id: z.number().int().positive(),
  form_title: z.string(),
  total_responses: z.number().int().nonnegative(),
  started_responses: z.number().int().nonnegative(),
  completed_responses: z.number().int().nonnegative(),
  average_completion_time_seconds: z.number().nullable(),
  questions: z.array(questionAnalyticsSchema),
});
