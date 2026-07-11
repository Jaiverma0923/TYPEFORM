import type { Form } from "@/types/form";

type FormPreviewProps = {
  form: Form;
  index: number; // Keep index in props for backward compatibility, but don't use it for variants
};

const palettes = [
  "bg-[var(--preview-tint-1-bg)] text-primary border-[var(--preview-tint-1-border)]",
  "bg-[var(--preview-tint-2-bg)] text-primary border-[var(--preview-tint-2-border)]",
  "bg-[var(--preview-tint-3-bg)] text-primary border-[var(--preview-tint-3-border)]",
  "bg-[var(--preview-tint-4-bg)] text-primary border-[var(--preview-tint-4-border)]",
  "bg-[var(--preview-tint-5-bg)] text-primary border-[var(--preview-tint-5-border)]",
];

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function FormPreview({ form }: FormPreviewProps) {
  const hash = getHash(String(form.id));
  const palette = palettes[hash % palettes.length];

  let variant = hash % 4;
  const firstQuestionType = form.questions?.[0]?.type;
  
  if (firstQuestionType === "short_text" || firstQuestionType === "long_text") {
    variant = 0;
  } else if (firstQuestionType === "multiple_choice" || firstQuestionType === "dropdown") {
    variant = 1;
  } else if (firstQuestionType === "rating") {
    variant = 2;
  } else if (firstQuestionType === "yes_no") {
    variant = 3;
  }

  return (
    <div className={`aspect-[6/5] rounded border p-4 sm:p-5 ${palette}`}>
      <div className="flex h-full flex-col justify-between rounded bg-surface/80 p-4 shadow-sm backdrop-blur-sm">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-secondary/60">
            Question {form.question_count > 0 ? "01" : "draft"}
          </p>
          <p className="mt-2 line-clamp-3 text-lg font-medium leading-snug text-primary">
            {form.questions?.[0]?.title || form.title}
          </p>
        </div>
        {variant === 0 ? (
          <div className="space-y-2 mt-4">
            <div className="h-[2px] w-full bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-8 rounded bg-accent/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-accent/60">OK</span>
              </div>
            </div>
          </div>
        ) : null}
        {variant === 1 ? (
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5 shadow-sm">
              <div className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border bg-page text-[9px] font-medium text-secondary">A</div>
              <div className="h-2 w-16 rounded-full bg-border" />
            </div>
            <div className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5 shadow-sm">
              <div className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border bg-page text-[9px] font-medium text-secondary">B</div>
              <div className="h-2 w-24 rounded-full bg-border" />
            </div>
          </div>
        ) : null}
        {variant === 2 ? (
          <div className="mt-4 flex gap-1.5 text-secondary" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, starIndex) => (
              <div key={starIndex} className="h-5 w-5 rounded-sm bg-border" />
            ))}
          </div>
        ) : null}
        {variant === 3 ? (
          <div className="mt-4 flex gap-2">
            <div className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-1.5 shadow-sm">
              <div className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border bg-page text-[9px] font-medium text-secondary">Y</div>
              <span className="text-xs font-medium text-secondary">Yes</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-border bg-surface px-3 py-1.5 shadow-sm">
              <div className="flex h-4 w-4 items-center justify-center rounded-[3px] border border-border bg-page text-[9px] font-medium text-secondary">N</div>
              <span className="text-xs font-medium text-secondary">No</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
