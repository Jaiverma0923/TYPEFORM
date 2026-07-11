"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { Form } from "@/types/form";

import { FormCard } from "./FormCard";

type FormsGridProps = {
  forms: Form[];
  pendingFormIds: Set<number>;
  onAnalytics: (form_id: number) => void;
  onCopyPublicLink: (form: Form) => void;
  onDelete: (form: Form) => void;
  onDuplicate: (form_id: number) => void;
  onOpen: (form_id: number) => void;
  onRename: (form: Form) => void;
  onResponses: (form_id: number) => void;
  onTogglePublish: (form: Form) => void;
};

export function FormsGrid({
  forms,
  onAnalytics,
  onCopyPublicLink,
  onDelete,
  onDuplicate,
  onOpen,
  onRename,
  onResponses,
  onTogglePublish,
  pendingFormIds,
}: FormsGridProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      initial={shouldReduceMotion ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.04,
          },
        },
      }}
    >
      <AnimatePresence mode="popLayout">
        {forms.map((form, index) => (
          <FormCard
            key={form.id}
            form={form}
            index={index}
            pending={pendingFormIds.has(form.id)}
            onAnalytics={onAnalytics}
            onCopyPublicLink={onCopyPublicLink}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onOpen={onOpen}
            onRename={onRename}
            onResponses={onResponses}
            onTogglePublish={onTogglePublish}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
