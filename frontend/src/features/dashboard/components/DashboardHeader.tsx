type DashboardHeaderProps = {
  totalForms: number;
};

export function DashboardHeader({ totalForms }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-primary sm:text-4xl">
          My forms
        </h1>
      </div>
      <p className="text-sm text-secondary opacity-90">
        {totalForms} {totalForms === 1 ? "form" : "forms"}
      </p>
    </div>
  );
}
