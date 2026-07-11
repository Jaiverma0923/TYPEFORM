"use client";

import { CalendarClock, LayoutGrid, Users, Workflow } from "lucide-react";
import { useState } from "react";

const tabs = [
  { key: "forms", label: "Forms", icon: LayoutGrid },
  { key: "contacts", label: "Contacts", icon: Users },
  { key: "automations", label: "Automations", icon: Workflow },
] as const;

export function DashboardTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("forms");

  return (
    <div className="border-b border-border bg-surface">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1" aria-label="Workspace sections">
          {tabs.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(key)}
                className={`relative flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-secondary hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="hidden items-center gap-2 py-2 sm:flex">
          <span className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm text-secondary">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Research Flow
          </span>
          <span className="rounded-full bg-page px-2 py-0.5 text-xs font-medium text-secondary">
            Demo
          </span>
        </div>
      </div>
    </div>
  );
}
