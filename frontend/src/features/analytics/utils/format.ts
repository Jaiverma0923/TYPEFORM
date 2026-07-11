export function formatDuration(seconds: number | null) {
  if (seconds === null) {
    return "Not recorded";
  }

  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  return remainingSeconds === 0
    ? `${minutes}m`
    : `${minutes}m ${remainingSeconds}s`;
}

export function formatQuestionType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPercent(value: number) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}
