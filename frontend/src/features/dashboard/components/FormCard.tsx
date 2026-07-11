"use client";

import { motion, useReducedMotion } from "framer-motion";

import type { Form } from "@/types/form";

import { formatResponseCount, formatUpdatedAt } from "../utils/format";
import { FormActionsMenu } from "./FormActionsMenu";
import { FormPreview } from "./FormPreview";
import { useState } from "react";

type FormCardProps = {
  form: Form;
  index: number;
  pending: boolean;
  onAnalytics: (form_id: number) => void;
  onCopyPublicLink: (form: Form) => void;
  onDelete: (form: Form) => void;
  onDuplicate: (form_id: number) => void;
  onOpen: (form_id: number) => void;
  onRename: (form: Form) => void;
  onResponses: (form_id: number) => void;
  onTogglePublish: (form: Form) => void;
};


export function FormCard({
  form,
  index,
  onAnalytics,
  onCopyPublicLink,
  onDelete,
  onDuplicate,
  onOpen,
  onRename,
  onResponses,
  onTogglePublish,
  pending,
}: FormCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(form.id);
    }
  }

  return (
    <motion.article
      layout
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.005 }}
      transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${form.title}`}
      className={`group relative block w-full cursor-pointer rounded-lg border border-stone-200/60 bg-surface p-3 text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-shadow hover:border-stone-300/80 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 flex flex-col h-full ${menuOpen ? "z-50" : "z-0"}`}
      onClick={() => onOpen(form.id)}
      onKeyDown={handleKeyDown}
    >
      <FormPreview form={form} index={index} />
      <div className="mt-4 flex flex-1 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col h-full justify-between">
          <div>
            <h2 className="truncate text-base font-medium text-primary">
              {form.title}
            </h2>
          </div>
          <div className="mt-3 flex flex-col gap-1 text-[11px] text-secondary opacity-75 transition-opacity group-hover:opacity-100">
            <div className="flex items-center gap-1.5">
              <div
                className={`h-1.5 w-1.5 rounded-full ${form.status === "published" ? "bg-[#1d7c38]" : "bg-secondary/40"}`}
                aria-hidden="true"
              />
              <span className="font-medium">
                {form.status === "published" ? "Published" : "Draft"}
              </span>
              <span className="opacity-50 mx-0.5">•</span>
              <span>{formatResponseCount(form.response_count)}</span>
            </div>
            <p className="opacity-80">
              {formatUpdatedAt(form.updated_at)}
            </p>
          </div>
        </div>
        <FormActionsMenu
          form={form}
          pending={pending}
          onAnalytics={onAnalytics}
          onCopyPublicLink={onCopyPublicLink}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onOpen={onOpen}
          onRename={onRename}
          onResponses={onResponses}
          onTogglePublish={onTogglePublish}
          onOpenChange={setMenuOpen}
        />
      </div>
    </motion.article>
  );
}
