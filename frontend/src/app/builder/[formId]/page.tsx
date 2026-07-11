import Link from "next/link";

import { BuilderWorkspace } from "@/features/builder/components/BuilderWorkspace";
import { parsePositiveIntegerId } from "@/features/builder/utils/routeParams";

type BuilderPageProps = {
  params: Promise<{
    formId: string;
  }>;
};

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { formId } = await params;
  const parsedFormId = parsePositiveIntegerId(formId);

  if (parsedFormId === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-stone-950">Invalid form route</h1>
          <p className="mt-2 text-sm text-stone-600">
            Form IDs must be positive integers.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return <BuilderWorkspace formId={parsedFormId} />;
}
