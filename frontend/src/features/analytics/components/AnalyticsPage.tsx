"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, ClipboardList, ExternalLink } from "lucide-react";

import { getResponsesRoute } from "@/features/responses/utils/routes";

import { useAnalytics } from "../hooks/useAnalytics";
import { formatDuration } from "../utils/format";
import { AnalyticsEmptyState, AnalyticsErrorState, AnalyticsSkeleton } from "./AnalyticsStates";
import { MetricCard } from "./MetricCard";
import { QuestionAnalyticsCard } from "./QuestionAnalyticsCard";

type AnalyticsPageProps = {
  formId: number;
};

export function AnalyticsPage({ formId }: AnalyticsPageProps) {
  const analyticsState = useAnalytics(formId);
  const responsesRoute = getResponsesRoute(formId) ?? "/";

  if (analyticsState.loading) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <AnalyticsSkeleton />
        </div>
      </main>
    );
  }

  if (analyticsState.error || !analyticsState.analytics) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <AnalyticsErrorState
            message={analyticsState.error ?? "This form could not be found."}
            onRetry={analyticsState.retry}
          />
        </div>
      </main>
    );
  }

  const analytics = analyticsState.analytics;

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-secondary">Analytics</p>
              <h1 className="mt-2 text-3xl font-normal tracking-tight text-primary sm:text-4xl">
                {analytics.form_title}
              </h1>
              <p className="mt-2 text-sm text-secondary">
                Insights update from the current mock response store.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2" aria-label="Form sections">
              <Link
                href={`/builder/${analytics.form_id}`}
                className="inline-flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open builder
              </Link>
              <Link
                href={responsesRoute}
                className="inline-flex items-center gap-2 rounded border border-border bg-surface px-4 py-2 text-sm font-medium text-primary transition hover:bg-page focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-1"
              >
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Responses
              </Link>
              <span className="inline-flex items-center gap-2 rounded bg-accent px-4 py-2 text-sm font-medium text-surface">
                <BarChart3 className="h-4 w-4" aria-hidden="true" />
                Analytics
              </span>
            </nav>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Analytics overview">
          <MetricCard
            label="Total responses"
            value={analytics.total_responses}
            description="Stored responses for this form"
          />
          <MetricCard
            label="Average completion"
            value={formatDuration(analytics.average_completion_time_seconds)}
            description="Based on submitted completion times"
          />
          <MetricCard
            label="Questions"
            value={analytics.questions.length}
            description="Current form definition"
          />
        </section>

        {analytics.total_responses === 0 ? (
          <AnalyticsEmptyState builderHref={`/builder/${analytics.form_id}`} />
        ) : (
          <section className="space-y-4" aria-label="Per-question analytics">
            {analytics.questions.map((question, index) => (
              <QuestionAnalyticsCard
                key={question.question_id}
                position={index + 1}
                question={question}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
