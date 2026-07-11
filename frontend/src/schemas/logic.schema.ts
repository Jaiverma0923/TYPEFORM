import { z } from "zod";

export const logicOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "greater_than",
  "less_than",
  "is_answered",
  "is_not_answered",
]);

export const logicActionSchema = z.enum(["go_to_question", "submit_form"]);

export const logicValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const logicRuleBaseSchema = z.object({
  id: z.number().int().positive(),
  form_id: z.number().int().positive(),
  source_question_id: z.number().int().positive(),
  operator: logicOperatorSchema,
  value: logicValueSchema,
  action: logicActionSchema,
  target_question_id: z.number().int().positive().nullable(),
  priority: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const logicRuleSchema = logicRuleBaseSchema.superRefine((rule, context) => {
  if (rule.action === "go_to_question" && rule.target_question_id === null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Target question is required.",
      path: ["target_question_id"],
    });
  }

  if (rule.action === "submit_form" && rule.target_question_id !== null) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Submit form rules cannot have a target question.",
      path: ["target_question_id"],
    });
  }
});

export const createLogicRuleSchema = logicRuleBaseSchema
  .omit({
    id: true,
    form_id: true,
    priority: true,
    created_at: true,
    updated_at: true,
  });

export const updateLogicRuleSchema = createLogicRuleSchema.partial();

export const reorderLogicRulesSchema = z.object({
  rule_ids: z.array(z.number().int().positive()),
});
