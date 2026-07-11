import { getThemeButtonStyle } from "@/features/theme/themeStyles";
import { useAppearanceStore } from "@/stores/appearance.store";
import type { FormTheme } from "@/types/theme";

type RespondentNavigationProps = {
  currentIndex: number;
  canGoPrevious?: boolean;
  isLastQuestion: boolean;
  submitting: boolean;
  theme?: FormTheme;
  onNext: () => void;
  onPrevious: () => void;
};

export function RespondentNavigation({
  currentIndex,
  canGoPrevious = currentIndex > 0,
  isLastQuestion,
  onNext,
  onPrevious,
  submitting,
  theme,
}: RespondentNavigationProps) {
  const appearance = useAppearanceStore((state) => state.appearance);

  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        className="min-h-11 rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
        style={theme ? getThemeButtonStyle(theme, false, appearance) : undefined}
        disabled={!canGoPrevious || submitting}
        onClick={onPrevious}
      >
        Previous
      </button>
      <button
        type="button"
        className="min-h-11 rounded-md bg-stone-950 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-stone-400"
        style={theme ? getThemeButtonStyle(theme, true, appearance) : undefined}
        disabled={submitting}
        onClick={onNext}
      >
        {submitting ? "Submitting..." : isLastQuestion ? "Finish" : "Next"}
      </button>
    </div>
  );
}
