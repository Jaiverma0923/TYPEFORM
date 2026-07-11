import { z } from "zod";

import { logicRuleSchema } from "./logic.schema";
import { questionSchema } from "./question.schema";
import { formThemeSchema } from "./theme.schema";

export const formStatusSchema = z.enum(["draft", "published"]);

export const formSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string(),
  status: formStatusSchema,
  version: z.number(),
  question_count: z.number(),
  response_count: z.number(),
  thank_you_title: z.string(),
  thank_you_message: z.string(),
  questions: z.array(questionSchema),
  logic_rules: z.array(logicRuleSchema),
  theme: formThemeSchema,
  created_at: z.string(),
  updated_at: z.string(),
  published_at: z.string().nullable(),
  public_url: z.string().optional(),
});

export const createFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  thank_you_title: z.string().optional(),
  thank_you_message: z.string().optional(),
});

export const updateFormSchema = createFormSchema.partial();
