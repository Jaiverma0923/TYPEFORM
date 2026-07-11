import Link from "next/link";

import { ResponseDetailPage } from "@/features/responses/components/ResponseDetailPage";
import { parsePositiveIntegerId } from "@/features/builder/utils/routeParams";

type ResponseDetailRouteProps = {
  params: Promise<{
    formId: string;
    responseId: string;
  }>;
};

export default async function ResponseDetailRoute({
  params,
}: ResponseDetailRouteProps) {
  const { formId, responseId } = await params;
  const parsedFormId = parsePositiveIntegerId(formId);
  const parsedResponseId = parsePositiveIntegerId(responseId);

  if (parsedFormId === null || parsedResponseId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-sm">
          <h1 className="text-xl font-medium text-primary">Invalid response route</h1>
          <p className="mt-2 text-sm text-secondary">
            Form and response IDs must be positive integers.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded bg-accent px-4 py-2 text-sm font-medium text-surface"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ResponseDetailPage formId={parsedFormId} responseId={parsedResponseId} />
  );
}
