import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          elevated: "var(--color-surface-elevated)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
        },
        primary: "var(--color-text-primary)",
        secondary: "var(--color-text-secondary)",
        success: {
          bg: "var(--color-success-bg)",
          text: "var(--color-success-text)",
        },
        draft: {
          bg: "var(--color-draft-bg)",
          text: "var(--color-draft-text)",
        },
        destructive: {
          bg: "var(--color-destructive-bg)",
          text: "var(--color-destructive-text)",
          btn: "var(--color-destructive-btn)",
          hover: "var(--color-destructive-btn-hover)",
        },
        "focus-ring": "var(--color-focus-ring)",
      },
    },
  },
  plugins: [],
};

export default config;
