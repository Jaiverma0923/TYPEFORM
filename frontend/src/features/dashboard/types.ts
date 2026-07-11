import type { FormStatus } from "@/types/form";

export type DashboardFilter = "all" | FormStatus;

export type DashboardSort =
  | "recently_updated"
  | "oldest_updated"
  | "title_asc"
  | "title_desc"
  | "most_responses";

export type DashboardDialog = "create" | "rename" | "delete" | null;

export const dashboardFilters: DashboardFilter[] = ["all", "draft", "published"];

export const dashboardSortOptions: Array<{
  value: DashboardSort;
  label: string;
}> = [
  { value: "recently_updated", label: "Recently updated" },
  { value: "oldest_updated", label: "Oldest updated" },
  { value: "title_asc", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" },
  { value: "most_responses", label: "Most responses" },
];
