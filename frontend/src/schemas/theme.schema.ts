import { z } from "zod";

export const themeFontFamilySchema = z.enum(["Inter", "Poppins", "DM Sans", "Manrope", "System"]);
export const themeBackgroundTypeSchema = z.enum(["solid", "gradient"]);
export const themeButtonStyleSchema = z.enum(["filled", "outline"]);

export const formThemeSchema = z.object({
  id: z.number().int().positive(),
  form_id: z.number().int().positive(),
  name: z.string(),
  colors: z.object({
    primary: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    border: z.string(),
    accent: z.string(),
  }),
  typography: z.object({
    font_family: themeFontFamilySchema,
    heading_weight: z.number().int(),
    body_weight: z.number().int(),
  }),
  background: z.object({
    type: themeBackgroundTypeSchema,
    value: z.string(),
  }),
  buttons: z.object({
    radius: z.number().int().min(0).max(24),
    style: themeButtonStyleSchema,
  }),
  inputs: z.object({
    radius: z.number().int().min(0).max(24),
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

export const updateThemeSchema = formThemeSchema
  .omit({ id: true, form_id: true, created_at: true, updated_at: true })
  .partial();
