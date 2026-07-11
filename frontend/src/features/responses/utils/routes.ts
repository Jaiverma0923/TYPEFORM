export function getResponsesRoute(form_id: number) {
  if (!Number.isFinite(form_id) || !Number.isInteger(form_id) || form_id < 1) {
    return null;
  }

  return `/forms/${form_id}/responses`;
}

export function getResponseDetailRoute(form_id: number, response_id: number) {
  const responsesRoute = getResponsesRoute(form_id);

  if (
    responsesRoute === null ||
    !Number.isFinite(response_id) ||
    !Number.isInteger(response_id) ||
    response_id < 1
  ) {
    return null;
  }

  return `${responsesRoute}/${response_id}`;
}
