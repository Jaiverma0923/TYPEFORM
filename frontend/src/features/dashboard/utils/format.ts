import type { FormStatus } from "@/types/form";

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function formatUpdatedAt(value: string) {
  const updatedAt = new Date(value).getTime();
  const now = Date.now();
  const diffMs = updatedAt - now;
  const absMs = Math.abs(diffMs);

  if (absMs < 60_000) {
    return "Updated just now";
  }

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 31_536_000_000],
    ["month", 2_592_000_000],
    ["week", 604_800_000],
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];

  const [unit, ms] =
    units.find(([, unitMs]) => absMs >= unitMs) ?? units[units.length - 1];

  return `Updated ${relativeFormatter.format(Math.round(diffMs / ms), unit)}`;
}

export function formatResponseCount(count: number) {
  return `${count} ${count === 1 ? "response" : "responses"}`;
}

export function formatStatus(status: FormStatus) {
  return status === "published" ? "Published" : "Draft";
}
