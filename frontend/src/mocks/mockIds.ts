export function createNumericId(existingIds: number[]) {
  return existingIds.length === 0 ? 1 : Math.max(...existingIds) + 1;
}
