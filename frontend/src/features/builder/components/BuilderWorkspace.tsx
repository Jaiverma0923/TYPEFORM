"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import type { BuilderMobileTab } from "../types";
import { BuilderErrorState, BuilderSkeleton } from "./BuilderStates";
import { BuilderTopbar } from "./BuilderTopbar";
import { DeleteQuestionDialog } from "./DeleteQuestionDialog";
import { LogicRulesPanel } from "./LogicRulesPanel";
import { PreviewModal } from "./PreviewModal";
import { QuestionCanvas } from "./QuestionCanvas";
import { QuestionSettingsPanel } from "./QuestionSettingsPanel";
import { QuestionSidebar } from "./QuestionSidebar";
import { ThemePanel } from "./ThemePanel";
import { useBuilderController } from "../hooks/useBuilderController";

type BuilderWorkspaceProps = {
  formId: number;
};

const mobileTabs: Array<{ value: BuilderMobileTab; label: string }> = [
  { value: "questions", label: "Questions" },
  { value: "edit", label: "Edit" },
  { value: "theme", label: "Theme" },
  { value: "logic", label: "Logic" },
  { value: "preview", label: "Preview" },
];

export function BuilderWorkspace({ formId }: BuilderWorkspaceProps) {
  const builder = useBuilderController(formId);
  const shouldReduceMotion = useReducedMotion();

  if (builder.loading) {
    return <BuilderSkeleton />;
  }

  if (builder.error || !builder.form) {
    return (
      <BuilderErrorState
        message={builder.error ?? "This form could not be found."}
        onRetry={builder.loadForm}
      />
    );
  }

  const pendingAdd = builder.pendingAction === "add";
  const pendingPublish = builder.pendingAction === "publish";
  const pendingDelete = builder.pendingAction === "delete";

  return (
    <div className="flex min-h-screen flex-col bg-page text-primary">
      <BuilderTopbar
        form={builder.form}
        saveStatus={builder.save_status}
        pendingPublish={pendingPublish}
        onCopyPublicLink={builder.copyPublicLink}
        onPreview={() => builder.setPreviewOpen(true)}
        onSaveTitle={builder.saveFormTitle}
        onTogglePublish={builder.togglePublish}
      />

      <div className="border-b border-border bg-surface px-3 py-2 lg:hidden">
        <div className="grid grid-cols-5 rounded-md bg-page p-1">
          {mobileTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={
                builder.mobileTab === tab.value
                  ? "rounded bg-surface px-3 py-2 text-sm font-medium text-primary shadow-sm"
                  : "rounded px-3 py-2 text-sm font-medium text-secondary"
              }
              onClick={() => builder.setMobileTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hidden min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)_340px] lg:grid">
        <QuestionSidebar
          questions={builder.questions}
          selectedQuestionId={builder.selected_question_id}
          pendingAdd={pendingAdd}
          onAddQuestion={builder.addQuestion}
          onDeleteQuestion={builder.setDeleteTarget}
          onReorderQuestions={builder.reorderQuestions}
          onSelectQuestion={builder.selectQuestion}
        />
        <QuestionCanvas
          question={builder.selectedQuestion}
          questions={builder.questions}
          hasQuestions={builder.questions.length > 0}
          theme={builder.form.theme}
          onAddQuestion={() => void builder.addQuestion("short_text")}
        />
        <div className="min-h-0 border-l border-border bg-surface">
          <div className="grid grid-cols-3 border-b border-border bg-page p-1">
            <button
              type="button"
              className={
                builder.sidePanel === "settings"
                  ? "rounded bg-surface px-3 py-2 text-sm font-medium text-primary shadow-sm"
                  : "rounded px-3 py-2 text-sm font-medium text-secondary"
              }
              onClick={() => builder.setSidePanel("settings")}
            >
              Settings
            </button>
            <button
              type="button"
              className={
                builder.sidePanel === "theme"
                  ? "rounded bg-surface px-3 py-2 text-sm font-medium text-primary shadow-sm"
                  : "rounded px-3 py-2 text-sm font-medium text-secondary"
              }
              onClick={() => builder.setSidePanel("theme")}
            >
              Theme
            </button>
            <button
              type="button"
              className={
                builder.sidePanel === "logic"
                  ? "rounded bg-surface px-3 py-2 text-sm font-medium text-primary shadow-sm"
                  : "rounded px-3 py-2 text-sm font-medium text-secondary"
              }
              onClick={() => builder.setSidePanel("logic")}
            >
              Logic
            </button>
          </div>
          {builder.sidePanel === "settings" ? (
            <QuestionSettingsPanel question={builder.selectedQuestion} />
          ) : null}
          {builder.sidePanel === "theme" ? (
            <ThemePanel
              formId={builder.form.id}
              pending={builder.pendingAction === "theme"}
              theme={builder.form.theme}
              onResetTheme={builder.restoreDefaultTheme}
              onUpdateTheme={builder.saveTheme}
            />
          ) : null}
          {builder.sidePanel === "logic" ? (
            <LogicRulesPanel
              formId={builder.form.id}
              pending={builder.pendingAction === "logic"}
              questions={builder.questions}
              rules={builder.logic_rules}
              onAddRule={builder.addLogicRule}
              onDeleteRule={builder.removeLogicRule}
              onReorderRules={builder.reorderLogicRules}
              onUpdateRule={builder.saveLogicRule}
            />
          ) : null}
        </div>
      </div>

      <div className="flex-1 lg:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={builder.mobileTab}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="min-h-[calc(100vh-8rem)]"
          >
            {builder.mobileTab === "questions" ? (
              <QuestionSidebar
                questions={builder.questions}
                selectedQuestionId={builder.selected_question_id}
                pendingAdd={pendingAdd}
                onAddQuestion={builder.addQuestion}
                onDeleteQuestion={builder.setDeleteTarget}
                onReorderQuestions={builder.reorderQuestions}
                onSelectQuestion={(question_id) => {
                  builder.selectQuestion(question_id);
                  builder.setMobileTab("edit");
                }}
              />
            ) : null}
            {builder.mobileTab === "edit" ? (
              <QuestionSettingsPanel question={builder.selectedQuestion} />
            ) : null}
            {builder.mobileTab === "logic" ? (
              <LogicRulesPanel
                formId={builder.form.id}
                pending={builder.pendingAction === "logic"}
                questions={builder.questions}
                rules={builder.logic_rules}
                onAddRule={builder.addLogicRule}
                onDeleteRule={builder.removeLogicRule}
                onReorderRules={builder.reorderLogicRules}
                onUpdateRule={builder.saveLogicRule}
              />
            ) : null}
            {builder.mobileTab === "theme" ? (
              <ThemePanel
                formId={builder.form.id}
                pending={builder.pendingAction === "theme"}
                theme={builder.form.theme}
                onResetTheme={builder.restoreDefaultTheme}
                onUpdateTheme={builder.saveTheme}
              />
            ) : null}
            {builder.mobileTab === "preview" ? (
              <QuestionCanvas
                questions={builder.questions}
                question={builder.selectedQuestion}
                hasQuestions={builder.questions.length > 0}
                theme={builder.form.theme}
                onAddQuestion={() => void builder.addQuestion("short_text")}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <DeleteQuestionDialog
        question={builder.deleteTarget}
        pending={pendingDelete}
        onClose={() => builder.setDeleteTarget(null)}
        onDelete={builder.deleteSelectedQuestion}
      />
      <PreviewModal
        form={builder.form}
        open={builder.previewOpen}
        onClose={() => builder.setPreviewOpen(false)}
      />
    </div>
  );
}
