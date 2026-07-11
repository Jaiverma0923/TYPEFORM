type MetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
};

export function MetricCard({ description, label, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <p className="text-sm font-medium text-secondary">{label}</p>
      <p className="mt-3 text-3xl font-normal tracking-tight text-primary">{value}</p>
      {description ? <p className="mt-2 text-sm text-secondary">{description}</p> : null}
    </div>
  );
}
