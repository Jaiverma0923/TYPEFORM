import type { FormTheme } from "@/types/theme";
import { getEffectiveTheme } from "@/features/theme/themeStyles";
import { useAppearanceStore } from "@/stores/appearance.store";

type RespondentProgressProps = {
  completedCount: number;
  currentIndex: number;
  progressPercent: number;
  theme?: FormTheme;
  totalQuestions: number;
};

export function RespondentProgress({
  completedCount,
  currentIndex,
  progressPercent,
  theme,
  totalQuestions,
}: RespondentProgressProps) {
  const appearance = useAppearanceStore((state) => state.appearance);
  const effectiveTheme = theme ? getEffectiveTheme(theme, appearance) : null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs font-medium text-stone-600">
        <span>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span>
          {completedCount} completed / {progressPercent}%
        </span>
      </div>
      <div
        className="mt-2 h-2 rounded-full bg-stone-200"
        style={effectiveTheme ? { backgroundColor: effectiveTheme.colors.border } : undefined}
      >
        <div
          className="h-2 rounded-full bg-stone-950 transition-all"
          style={{ width: `${progressPercent}%`, backgroundColor: effectiveTheme?.colors.primary }}
        />
      </div>
    </div>
  );
}
