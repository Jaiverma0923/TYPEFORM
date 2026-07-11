"use client";

import type { ReactNode } from "react";

import type {
  FormTheme,
  ThemeBackgroundType,
  ThemeButtonStyle,
  ThemeFontFamily,
  UpdateThemePayload,
} from "@/types/theme";

import { createThemeFromPreset, themePresets, type ThemePresetName } from "@/features/theme/themePresets";

type ThemePanelProps = {
  formId: number;
  pending?: boolean;
  theme: FormTheme;
  onResetTheme: () => void;
  onUpdateTheme: (payload: UpdateThemePayload) => void;
};

const fontFamilies: ThemeFontFamily[] = ["Inter", "Poppins", "DM Sans", "Manrope", "System"];
const headingWeights = [400, 500, 600, 700];
const bodyWeights = [400, 500, 600];

function FieldGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="space-y-3 border-b border-border px-4 py-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary">{title}</h3>
      {children}
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-primary">{children}</span>;
}

export function ThemePanel({
  formId,
  onResetTheme,
  onUpdateTheme,
  pending = false,
  theme,
}: ThemePanelProps) {
  function applyPreset(preset: ThemePresetName) {
    const nextTheme = createThemeFromPreset(preset, formId, theme.id);
    onUpdateTheme({
      name: nextTheme.name,
      colors: nextTheme.colors,
      typography: nextTheme.typography,
      background: nextTheme.background,
      buttons: nextTheme.buttons,
      inputs: nextTheme.inputs,
    });
  }

  return (
    <aside className="h-full overflow-y-auto bg-surface">
      <div className="border-b border-border px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Theme</p>
        <h2 className="mt-1 text-lg font-semibold text-primary">Form appearance</h2>
        <p className="mt-1 text-sm text-secondary">
          Tune the colors and controls used by the builder preview and public form.
        </p>
      </div>

      <FieldGroup title="Preset">
        <label className="grid gap-2">
          <Label>Theme preset</Label>
          <select
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
            value={theme.name}
            onChange={(event) => applyPreset(event.target.value as ThemePresetName)}
          >
            {themePresets.map((preset) => (
              <option key={preset}>{preset}</option>
            ))}
          </select>
        </label>
      </FieldGroup>

      <FieldGroup title="Colors">
        <div className="grid gap-3">
          {Object.entries(theme.colors).map(([key, value]) => (
            <label key={key} className="grid grid-cols-[1fr_auto] items-center gap-3">
              <Label>{key.replace("_", " ")}</Label>
              <input
                aria-label={`${key} color`}
                className="h-9 w-12 rounded border border-border bg-surface p-1"
                type="color"
                value={value}
                onChange={(event) =>
                  onUpdateTheme({
                    colors: { [key]: event.target.value } as Partial<FormTheme["colors"]>,
                  })
                }
              />
            </label>
          ))}
        </div>
      </FieldGroup>

      <FieldGroup title="Typography">
        <label className="grid gap-2">
          <Label>Font family</Label>
          <select
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
            value={theme.typography.font_family}
            onChange={(event) =>
              onUpdateTheme({
                typography: { font_family: event.target.value as ThemeFontFamily },
              })
            }
          >
            {fontFamilies.map((font) => (
              <option key={font}>{font}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2">
            <Label>Heading</Label>
            <select
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
              value={theme.typography.heading_weight}
              onChange={(event) =>
                onUpdateTheme({
                  typography: { heading_weight: Number(event.target.value) },
                })
              }
            >
              {headingWeights.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2">
            <Label>Body</Label>
            <select
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
              value={theme.typography.body_weight}
              onChange={(event) =>
                onUpdateTheme({
                  typography: { body_weight: Number(event.target.value) },
                })
              }
            >
              {bodyWeights.map((weight) => (
                <option key={weight} value={weight}>
                  {weight}
                </option>
              ))}
            </select>
          </label>
        </div>
      </FieldGroup>

      <FieldGroup title="Background">
        <label className="grid gap-2">
          <Label>Type</Label>
          <select
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
            value={theme.background.type}
            onChange={(event) =>
              onUpdateTheme({
                background: { type: event.target.value as ThemeBackgroundType },
              })
            }
          >
            <option value="solid">Solid</option>
            <option value="gradient">Gradient</option>
          </select>
        </label>
        <label className="grid gap-2">
          <Label>Value</Label>
          <input
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
            value={theme.background.value}
            onChange={(event) =>
              onUpdateTheme({
                background: { value: event.target.value },
              })
            }
          />
        </label>
      </FieldGroup>

      <FieldGroup title="Buttons and inputs">
        <label className="grid gap-2">
          <Label>Button style</Label>
          <select
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary"
            value={theme.buttons.style}
            onChange={(event) =>
              onUpdateTheme({
                buttons: { style: event.target.value as ThemeButtonStyle },
              })
            }
          >
            <option value="filled">Filled</option>
            <option value="outline">Outline</option>
          </select>
        </label>
        <label className="grid gap-2">
          <Label>Button radius: {theme.buttons.radius}px</Label>
          <input
            max={24}
            min={0}
            type="range"
            value={theme.buttons.radius}
            onChange={(event) =>
              onUpdateTheme({
                buttons: { radius: Number(event.target.value) },
              })
            }
          />
        </label>
        <label className="grid gap-2">
          <Label>Input radius: {theme.inputs.radius}px</Label>
          <input
            max={24}
            min={0}
            type="range"
            value={theme.inputs.radius}
            onChange={(event) =>
              onUpdateTheme({
                inputs: { radius: Number(event.target.value) },
              })
            }
          />
        </label>
      </FieldGroup>

      <div className="px-4 py-5">
        <button
          type="button"
          className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium text-primary disabled:opacity-50"
          disabled={pending}
          onClick={onResetTheme}
        >
          {pending ? "Resetting..." : "Reset to default"}
        </button>
      </div>
    </aside>
  );
}
