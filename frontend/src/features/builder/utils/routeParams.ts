export function parsePositiveIntegerId(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
