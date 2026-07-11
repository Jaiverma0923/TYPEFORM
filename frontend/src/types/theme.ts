export type Appearance = "light" | "dark";

export type ThemeBackgroundType = "solid" | "gradient";
export type ThemeButtonStyle = "filled" | "outline";
export type ThemeFontFamily = "Inter" | "Poppins" | "DM Sans" | "Manrope" | "System";

export interface FormTheme {
  id: number;
  form_id: number;
  name: string;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
    accent: string;
  };
  typography: {
    font_family: ThemeFontFamily;
    heading_weight: number;
    body_weight: number;
  };
  background: {
    type: ThemeBackgroundType;
    value: string;
  };
  buttons: {
    radius: number;
    style: ThemeButtonStyle;
  };
  inputs: {
    radius: number;
  };
  created_at: string;
  updated_at: string;
}

export type UpdateThemePayload = Partial<{
  name: string;
  colors: Partial<FormTheme["colors"]>;
  typography: Partial<FormTheme["typography"]>;
  background: Partial<FormTheme["background"]>;
  buttons: Partial<FormTheme["buttons"]>;
  inputs: Partial<FormTheme["inputs"]>;
}>;
