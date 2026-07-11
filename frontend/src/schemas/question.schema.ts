import { z } from "zod";

export const questionTypeSchema = z.enum([
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "email",
  "number",
  "yes_no",
  "rating",
]);

export const questionSettingsSchema = z.object({
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  placeholder: z.string().optional(),
});

export const questionSchema = z.object({
  id: z.number().int().positive(),
  form_id: z.number().int().positive(),
  type: questionTypeSchema,
  title: z.string(),
  description: z.string().nullable(),
  required: z.boolean(),
  position: z.number(),
  settings: questionSettingsSchema,
  version: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const createQuestionSchema = z.object({
  type: questionTypeSchema,
  title: z.string().min(1),
  description: z.string().nullable(),
  required: z.boolean(),
  position: z.number(),
  settings: questionSettingsSchema,
});

export const updateQuestionSchema = createQuestionSchema.partial();
