"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import type { DashboardFilter, DashboardSort } from "../types";
import { dashboardFilters, dashboardSortOptions } from "../types";
import { formatStatus } from "../utils/format";

type DashboardControlsProps = {
  activeFilter: DashboardFilter;
  searchQuery: string;
  sortOption: DashboardSort;
  onFilterChange: (filter: DashboardFilter) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: DashboardSort) => void;
};

export function DashboardControls({
  activeFilter,
  onFilterChange,
  onSearchChange,
  onSortChange,
  searchQuery,
  sortOption,
}: DashboardControlsProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setLocalSearch(value);
    startTransition(() => {
      onSearchChange(value);
    });
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative overflow-hidden rounded border border-border bg-surface p-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] sm:w-auto overflow-x-auto no-scrollbar">
        <div className="flex min-w-max items-center">
          {dashboardFilters.map((filter) => {
            const isActive = activeFilter === filter;
            const label = filter === "all" ? "All forms" : formatStatus(filter);
            return (
              <button
                key={filter}
                type="button"
                data-testid={`filter-${filter}`}
                onClick={() => onFilterChange(filter)}
                className={`relative px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-1 rounded ${
                  isActive ? "text-primary" : "text-secondary hover:text-primary"
                }`}
                aria-pressed={isActive}
              >
                {isActive ? (
                  <span
                    className="absolute inset-0 rounded bg-page shadow-sm"
                    aria-hidden="true"
                  />
                ) : null}
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <label htmlFor="search-forms" className="sr-only">
            Search forms
          </label>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-secondary/60">
            <Search className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            id="search-forms"
            type="search"
            placeholder="Search forms..."
            value={localSearch}
            onChange={handleSearch}
            className="h-10 w-full rounded border border-transparent bg-surface px-4 py-2 pl-9 text-sm text-primary shadow-[0_2px_8px_rgba(0,0,0,0.02)] outline-none transition placeholder:text-secondary/50 focus:border-border-hover focus:ring-1 focus:ring-accent sm:w-64"
          />
        </div>
        <div className="relative">
          <label htmlFor="sort-forms" className="sr-only">
            Sort forms
          </label>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-secondary/60">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </div>
          <select
            id="sort-forms"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as DashboardSort)}
            className="h-10 w-full appearance-none rounded border border-transparent bg-surface px-4 py-2 pr-9 text-sm font-medium text-primary shadow-[0_2px_8px_rgba(0,0,0,0.02)] outline-none transition focus:border-border-hover focus:ring-1 focus:ring-accent sm:w-auto"
          >
            {dashboardSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
