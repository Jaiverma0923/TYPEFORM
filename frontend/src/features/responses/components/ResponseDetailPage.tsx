"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { useResponseDetail } from "../hooks/useResponseDetail";
import { AnswerValue } from "./AnswerValue";
import { ResponsesErrorState, ResponsesSkeleton } from "./ResponsesStates";
import { formatCompletionTime, formatSubmittedAt } from "../utils/format";
import { getResponsesRoute } from "../utils/routes";

type ResponseDetailPageProps = {
  formId: number;
  responseId: number;
};

export function ResponseDetailPage({
  formId,
  responseId,
}: ResponseDetailPageProps) {
  const detail = useResponseDetail(responseId);
  const responsesRoute = getResponsesRoute(formId) ?? "/";

  if (detail.loading) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <ResponsesSkeleton />
        </div>
      </main>
    );
  }

  const formMismatch =
    detail.response !== null && detail.response.form.id !== formId;

  if (detail.error || !detail.response || formMismatch) {
    return (
      <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <ResponsesErrorState
            title="Response could not be loaded"
            message={
              detail.error ??
              "This response does not belong to the requested form."
            }
            backHref={responsesRoute}
            onRetry={detail.retry}
          />
        </div>
      </main>
    );
  }

  const response = detail.response;

  return (
    <main className="min-h-screen bg-page px-4 py-8 text-primary sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-6">
          <Link
            href={responsesRoute}
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to responses
          </Link>
          <div className="rounded-lg border border-border bg-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <p className="text-sm font-medium text-secondary">{response.form.title}</p>
            <h1 className="mt-2 text-3xl font-normal tracking-tight text-primary">
              Response #{response.id}
            </h1>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-secondary">Submitted</dt>
                <dd className="mt-1">
                  <time dateTime={response.submitted_at}>
                    {formatSubmittedAt(response.submitted_at)}
                  </time>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-secondary">Completion time</dt>
                <dd className="mt-1">
                  {formatCompletionTime(response.completion_time_seconds)}
                </dd>
              </div>
            </dl>
          </div>
        </header>

        <section aria-label="Response answers" className="space-y-4">
          {response.answers.map((answer) => (
            <article
              key={answer.question_id}
              className="rounded-lg border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-secondary">
                    {answer.question_type.replace("_", " ")}
                  </p>
                  <h2 className="mt-2 text-lg font-medium text-primary">
                    {answer.question_title}
                  </h2>
                </div>
                <span className="text-xs font-medium text-secondary">
                  Question #{answer.question_id}
                </span>
              </div>
              <div className="mt-5 rounded bg-page p-4 text-sm leading-6">
                <AnswerValue value={answer.value} />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
