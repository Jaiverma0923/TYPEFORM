"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Copy,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Form } from "@/types/form";

type FormActionsMenuProps = {
  form: Form;
  pending: boolean;
  onCopyPublicLink: (form: Form) => void;
  onAnalytics: (form_id: number) => void;
  onDelete: (form: Form) => void;
  onDuplicate: (form_id: number) => void;
  onOpen: (form_id: number) => void;
  onRename: (form: Form) => void;
  onResponses: (form_id: number) => void;
  onTogglePublish: (form: Form) => void;
  onOpenChange?: (open: boolean) => void;
};

export function FormActionsMenu({
  form,
  onAnalytics,
  onCopyPublicLink,
  onDelete,
  onDuplicate,
  onOpen,
  onRename,
  onResponses,
  onTogglePublish,
  pending,
  onOpenChange,
}: FormActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  function setMenuOpen(value: boolean) {
    setOpen(value);
    onOpenChange?.(value);
  }
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setMenuOpen]);

  function runAction(action: () => void) {
    action();
    setMenuOpen(false);
  }

  const itemClass =
    "flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-secondary transition hover:bg-page hover:text-primary focus:bg-page focus:text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.stopPropagation();
        }

        if (event.key === "Escape") {
          setMenuOpen(false);
        }
      }}
    >
      <button
        type="button"
        data-testid={`form-actions-${form.id}`}
        aria-label={`Open actions for ${form.title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded p-1.5 text-secondary transition hover:bg-border/50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
        onClick={() => setMenuOpen(!open)}
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            className="absolute right-0 top-11 z-20 w-56 rounded border border-border bg-surface p-1.5 shadow-lg"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <button
              type="button"
              data-testid={`form-action-open-${form.id}`}
              role="menuitem"
              className={itemClass}
              onClick={() => runAction(() => onOpen(form.id))}
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Open
            </button>
            <button
              type="button"
              data-testid={`form-action-rename-${form.id}`}
              role="menuitem"
              className={itemClass}
              onClick={() => runAction(() => onRename(form))}
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Rename
            </button>
            <button
              type="button"
              data-testid={`form-action-duplicate-${form.id}`}
              role="menuitem"
              className={itemClass}
              disabled={pending}
              onClick={() => runAction(() => onDuplicate(form.id))}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Duplicate
            </button>
            <button
              type="button"
              data-testid={`form-action-toggle-publish-${form.id}`}
              role="menuitem"
              className={itemClass}
              disabled={pending}
              onClick={() => runAction(() => onTogglePublish(form))}
            >
              {form.status === "published" ? (
                <Undo2 className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {form.status === "published" ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              data-testid={`form-action-responses-${form.id}`}
              role="menuitem"
              className={itemClass}
              onClick={() => runAction(() => onResponses(form.id))}
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              View responses
            </button>
            <button
              type="button"
              data-testid={`form-action-analytics-${form.id}`}
              role="menuitem"
              className={itemClass}
              onClick={() => runAction(() => onAnalytics(form.id))}
            >
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              View analytics
            </button>
            {form.status === "published" && form.slug ? (
              <button
                type="button"
                data-testid={`form-action-copy-${form.id}`}
                role="menuitem"
                className={itemClass}
                disabled={pending}
                onClick={() => runAction(() => onCopyPublicLink(form))}
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copy public link
              </button>
            ) : null}
            <div className="my-1 border-t border-border" />
            <button
              type="button"
              data-testid={`form-action-delete-${form.id}`}
              role="menuitem"
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-destructive-text transition hover:bg-destructive-bg focus:bg-destructive-bg focus:outline-none"
              onClick={() => runAction(() => onDelete(form))}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
