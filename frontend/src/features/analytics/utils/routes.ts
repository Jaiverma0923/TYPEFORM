export function getAnalyticsRoute(form_id: number) {
  if (!Number.isFinite(form_id) || !Number.isInteger(form_id) || form_id < 1) {
    return null;
  }

  return `/forms/${form_id}/analytics`;
}
