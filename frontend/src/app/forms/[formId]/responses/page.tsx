import Link from "next/link";

import { ResponsesPage } from "@/features/responses/components/ResponsesPage";
import { parsePositiveIntegerId } from "@/features/builder/utils/routeParams";

type ResponsesRouteProps = {
  params: Promise<{
    formId: string;
  }>;
};

export default async function FormResponsesRoute({ params }: ResponsesRouteProps) {
  const { formId } = await params;
  const parsedFormId = parsePositiveIntegerId(formId);

  if (parsedFormId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-page px-4">
        <div className="max-w-md rounded-lg border border-border bg-surface p-6 text-center shadow-sm">
          <h1 className="text-xl font-medium text-primary">Invalid responses route</h1>
          <p className="mt-2 text-sm text-secondary">
            Form IDs must be positive integers.
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

  return <ResponsesPage formId={parsedFormId} />;
}
