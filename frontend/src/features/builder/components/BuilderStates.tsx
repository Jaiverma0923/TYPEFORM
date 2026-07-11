import Link from "next/link";

type BuilderErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function BuilderSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="h-16 border-b border-stone-200 bg-white" />
      <div className="grid gap-4 p-4 lg:grid-cols-[280px_1fr_340px]">
        <div className="h-[calc(100vh-6rem)] animate-pulse rounded-lg bg-stone-100" />
        <div className="h-[calc(100vh-6rem)] animate-pulse rounded-lg bg-stone-100" />
        <div className="h-[calc(100vh-6rem)] animate-pulse rounded-lg bg-stone-100" />
      </div>
    </div>
  );
}

export function BuilderErrorState({ message, onRetry }: BuilderErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-stone-950">Builder could not load</h1>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            className="rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white"
            onClick={onRetry}
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export function EmptyBuilderState({ onAddQuestion }: { onAddQuestion: () => void }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-stone-950">No questions yet</h2>
      <p className="mt-2 max-w-sm text-sm text-stone-600">
        Add your first question to start building this form.
      </p>
      <button
        type="button"
        className="mt-5 rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
        onClick={onAddQuestion}
      >
        Add first question
      </button>
    </div>
  );
}
