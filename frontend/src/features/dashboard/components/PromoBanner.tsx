"use client";

import { Tag, X } from "lucide-react";
import { useState } from "react";

export function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="border-b border-[#cbe9d3] bg-[#eaf8ee]">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <Tag className="h-4 w-4 shrink-0 text-[#1d7c38]" aria-hidden="true" />
          <p className="truncate text-sm text-[#1d4b28]">
            You can collect <span className="font-semibold">10 form responses</span> this month
            for free.
          </p>
          <button
            type="button"
            className="ml-2 hidden shrink-0 rounded bg-[#1d7c38] px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-[#186a2f] sm:inline-flex"
          >
            Get more responses
          </button>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 text-[#1d4b28]/70 transition hover:bg-[#d9f0df] hover:text-[#1d4b28]"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className="mx-4 mb-3 block rounded bg-[#1d7c38] px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-[#186a2f] sm:hidden"
      >
        Get more responses
      </button>
    </div>
  );
}
