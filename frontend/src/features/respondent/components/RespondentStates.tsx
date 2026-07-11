type RespondentErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function RespondentSkeleton() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="h-5 w-24 animate-pulse rounded bg-stone-200" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-stone-200" />
          <div className="h-5 w-1/2 animate-pulse rounded bg-stone-100" />
        </div>
        <div className="h-14 w-full animate-pulse rounded-md bg-stone-100" />
        <div className="flex justify-between">
          <div className="h-10 w-28 animate-pulse rounded bg-stone-100" />
          <div className="h-10 w-24 animate-pulse rounded bg-stone-200" />
        </div>
      </div>
    </main>
  );
}

export function RespondentErrorState({ message, onRetry }: RespondentErrorStateProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-stone-950">Form unavailable</h1>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
        <button
          type="button"
          className="mt-6 rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </main>
  );
}

export function RespondentEmptyState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
      <div className="max-w-md rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-stone-950">This form has no questions</h1>
        <p className="mt-2 text-sm text-stone-600">There is nothing to complete yet.</p>
      </div>
    </main>
  );
}
