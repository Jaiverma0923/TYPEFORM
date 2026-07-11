import type {
  ChoiceAnalyticsSummary,
  QuestionAnalytics,
  RatingAnalyticsSummary,
  YesNoAnalyticsSummary,
} from "@/types/analytics";

import { formatPercent, formatQuestionType } from "../utils/format";

function isChoiceSummary(summary: QuestionAnalytics["summary"]): summary is ChoiceAnalyticsSummary {
  return Boolean(summary && "counts" in summary);
}

function isRatingSummary(summary: QuestionAnalytics["summary"]): summary is RatingAnalyticsSummary {
  return Boolean(summary && "distribution" in summary);
}

function isYesNoSummary(summary: QuestionAnalytics["summary"]): summary is YesNoAnalyticsSummary {
  return Boolean(summary && "yes" in summary && "no" in summary);
}

function BarRow({
  count,
  label,
  percentage,
}: {
  count: number;
  label: string;
  percentage: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-primary">{label}</span>
        <span className="shrink-0 text-secondary">
          {count} / {formatPercent(percentage)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-page">
        <div
          className="h-2 rounded-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
    </div>
  );
}

function ChoiceSummary({ summary }: { summary: ChoiceAnalyticsSummary }) {
  return (
    <div className="space-y-4">
      {summary.counts.map((item) => (
        <BarRow
          key={item.label}
          label={item.label}
          count={item.count}
          percentage={item.percentage}
        />
      ))}
    </div>
  );
}

function RatingSummary({ summary }: { summary: RatingAnalyticsSummary }) {
  const maxCount = Math.max(1, ...summary.distribution.map((item) => item.count));

  return (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        Average rating:{" "}
        <span className="font-medium text-primary">
          {summary.average === null ? "No ratings yet" : summary.average}
        </span>
      </p>
      <div className="space-y-3">
        {summary.distribution.map((item) => (
          <div key={item.value} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-primary">{item.value}</span>
              <span className="text-secondary">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-page">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function YesNoSummary({ summary }: { summary: YesNoAnalyticsSummary }) {
  const total = summary.yes + summary.no;
  const yesPercentage = total === 0 ? 0 : (summary.yes / total) * 100;
  const noPercentage = total === 0 ? 0 : (summary.no / total) * 100;

  return (
    <div className="space-y-4">
      <BarRow label="Yes" count={summary.yes} percentage={yesPercentage} />
      <BarRow label="No" count={summary.no} percentage={noPercentage} />
    </div>
  );
}

export function QuestionAnalyticsCard({
  position,
  question,
}: {
  position: number;
  question: QuestionAnalytics;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-secondary">
            Question {position} / {formatQuestionType(question.type)}
          </p>
          <h2 className="mt-2 text-lg font-medium text-primary">{question.title}</h2>
        </div>
        <div className="text-sm text-secondary">
          <span className="font-medium text-primary">{question.answered_count}</span>{" "}
          answered / {question.skipped_count} skipped
        </div>
      </div>
      <div className="mt-5">
        {isChoiceSummary(question.summary) ? <ChoiceSummary summary={question.summary} /> : null}
        {isRatingSummary(question.summary) ? <RatingSummary summary={question.summary} /> : null}
        {isYesNoSummary(question.summary) ? <YesNoSummary summary={question.summary} /> : null}
        {question.summary === null ? (
          <p className="rounded bg-page p-4 text-sm text-secondary">
            Text responses are available in the Responses view.
          </p>
        ) : null}
      </div>
    </article>
  );
}
