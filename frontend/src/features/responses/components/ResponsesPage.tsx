"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, Download, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { getAnalyticsRoute } from "@/features/analytics/utils/routes";
import { downloadCsvExport, exportResponsesCsv } from "@/services/responses.api";

import { useResponsesList } from "../hooks/useResponsesList";
import {
  ResponsesEmptyState,
  ResponsesErrorState,
  ResponsesSkeleton,
} from "./ResponsesStates";
import { AnswerValue } from "./AnswerValue";
import {
  formatAnswerCount,
  formatCompletionTime,
  formatSubmittedAt,
} from "../utils/format";
import { getResponseDetailRoute } from "../utils/routes";

type ResponsesPageProps = {
  formId: number;
};

export function ResponsesPage({ formId }: ResponsesPageProps) {
  const responses = useResponsesList(formId);
  const [exporting, setExporting] = useState(false);

  async function handleExportCsv() {
    if (!responses.data || exporting) {
      return;
    }

    setExporting(true);

    try {
      const result = await exportResponsesCsv(responses.data.form.id);
      downloadCsvExport(result);
      toast.success("CSV export started.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "CSV export failed.";
      toast.error(message);
    } finally {
      setExporting(false);
    }
  }

  if (responses.loading) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ResponsesSkeleton />
        </div>
      </main>
    );
  }

  if (responses.error || !responses.data) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ResponsesErrorState
            title="Responses could not be loaded"
            message={responses.error ?? "This form could not be found."}
            backHref="/"
            onRetry={responses.retry}
          />
        </div>
      </main>
    );
  }

  const { form, items, pagination } = responses.data;
  const analyticsRoute = getAnalyticsRoute(form.id);

  return (
    <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Responses</p>
              <h1 className="mt-2 text-3xl font-normal tracking-tight text-primary sm:text-4xl">
                {form.title}
              </h1>
              <p className="mt-2 text-sm text-secondary">
                {pagination.total} {pagination.total === 1 ? "response" : "responses"} collected
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-live="polite"
                className="inline-flex items-center justify-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={exporting}
                onClick={handleExportCsv}
              >
                {exporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="h-4 w-4" aria-hidden="true" />
                )}
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
              <Link
                href={`/builder/${form.id}`}
                className="inline-flex items-center justify-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
              >
                Open builder
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
              {analyticsRoute ? (
                <Link
                  href={analyticsRoute}
                  className="inline-flex items-center justify-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
                >
                  Analytics
                  <BarChart3 className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        {items.length === 0 ? (
          <ResponsesEmptyState builderHref={`/builder/${form.id}`} />
        ) : (
          <section
            aria-label={`${form.title} response submissions`}
            className="overflow-hidden rounded-lg border border-border bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
          >
            <div className="hidden border-b border-border bg-page/60 px-5 py-3 text-xs font-medium uppercase tracking-wide text-secondary md:grid md:grid-cols-[1fr_1fr_120px_1.5fr] md:gap-5">
              <span>Submitted</span>
              <span>Completion</span>
              <span>Answers</span>
              <span>Preview</span>
            </div>
            <div className="divide-y divide-border">
              {items.map((response) => (
                <Link
                  key={response.id}
                  href={getResponseDetailRoute(form.id, response.id) ?? "#"}
                  className="block p-5 transition hover:bg-page/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-focus-ring"
                >
                  <article className="grid gap-4 md:grid-cols-[1fr_1fr_120px_1.5fr] md:items-start md:gap-5">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        Response #{response.id}
                      </p>
                      <time
                        dateTime={response.submitted_at}
                        className="mt-1 block text-sm text-secondary"
                      >
                        {formatSubmittedAt(response.submitted_at)}
                      </time>
                    </div>
                    <div className="text-sm text-secondary">
                      {formatCompletionTime(response.completion_time_seconds)}
                    </div>
                    <div className="text-sm text-secondary">
                      {formatAnswerCount(response.answer_count)}
                    </div>
                    <div className="space-y-3">
                      {response.preview.length > 0 ? (
                        response.preview.map((answer) => (
                          <div key={answer.question_id} className="text-sm">
                            <p className="font-medium text-secondary">
                              {answer.question_title}
                            </p>
                            <p className="mt-1">
                              <AnswerValue value={answer.value} />
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-secondary">No preview answers</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
