"use client";

import { Sparkles, X } from "lucide-react";
import { useState } from "react";

type Suggestion = {
  id: string;
  description: string;
};

const initialSuggestions: Suggestion[] = [
  {
    id: "merch-orders",
    description:
      "Create a Gather orders and payments for student club merchandise or supplies quickly.",
  },
  {
    id: "tutoring",
    description:
      "Create an Allow students to book tutoring slots and pay for sessions seamlessly online.",
  },
  {
    id: "rsvp",
    description:
      "Create a Collect RSVPs and payments for campus events or study group sessions efficiently.",
  },
];

export function SuggestedTemplates({ onUseTemplate }: { onUseTemplate: () => void }) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className="relative rounded-lg border border-[#e7ddf5] bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <button
            type="button"
            aria-label="Dismiss suggestion"
            onClick={() =>
              setSuggestions((current) => current.filter((item) => item.id !== suggestion.id))
            }
            className="absolute right-3 top-3 rounded p-0.5 text-secondary/60 transition hover:bg-page hover:text-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <Sparkles className="h-4 w-4 text-[#8b5cf6]" aria-hidden="true" />
          <p className="mt-3 pr-5 text-sm leading-snug text-primary">{suggestion.description}</p>
          <button
            type="button"
            onClick={onUseTemplate}
            className="mt-4 rounded border border-border bg-surface px-3.5 py-1.5 text-sm font-medium text-primary transition hover:bg-page"
          >
            Use this form
          </button>
        </div>
      ))}
    </div>
  );
}
