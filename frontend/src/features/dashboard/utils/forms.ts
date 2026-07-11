import type { Form } from "@/types/form";

import type { DashboardFilter, DashboardSort } from "../types";

export function getVisibleForms(
  forms: Form[],
  searchQuery: string,
  activeFilter: DashboardFilter,
  sortOption: DashboardSort,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return forms
    .filter((form) => {
      const matchesSearch = form.title.toLowerCase().includes(normalizedSearch);
      const matchesFilter =
        activeFilter === "all" ? true : form.status === activeFilter;

      return matchesSearch && matchesFilter;
    })
    .toSorted((a, b) => {
      if (sortOption === "oldest_updated") {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }

      if (sortOption === "title_asc") {
        return a.title.localeCompare(b.title);
      }

      if (sortOption === "title_desc") {
        return b.title.localeCompare(a.title);
      }

      if (sortOption === "most_responses") {
        return b.response_count - a.response_count;
      }

      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
}

export function getPublicFormUrl(form: Form) {
  if (form.public_url) {
    return form.public_url;
  }

  if (!form.slug || typeof window === "undefined") {
    return null;
  }

  return `${window.location.origin}/form/${form.slug}`;
}
