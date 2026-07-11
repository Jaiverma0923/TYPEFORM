"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { getResponsesRoute } from "@/features/responses/utils/routes";
import { getAnalyticsRoute } from "@/features/analytics/utils/routes";

import { DashboardControls } from "./DashboardControls";
import { DashboardEmptyState, DashboardErrorState, DashboardSkeleton } from "./DashboardStates";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardTopbar } from "./DashboardTopbar";
import { DeleteFormDialog } from "./DeleteFormDialog";
import { FormDialog } from "./FormDialog";
import { FormsGrid } from "./FormsGrid";
import { useDashboard } from "../hooks/useDashboard";

export function DashboardPage() {
  const router = useRouter();
  const dashboard = useDashboard();
  const shouldReduceMotion = useReducedMotion();

  const pendingFormIds = useMemo(() => {
    const ids = new Set<number>();

    for (const value of Object.values(dashboard.pendingMutations)) {
      if (typeof value === "number") {
        ids.add(value);
      }
    }

    return ids;
  }, [dashboard.pendingMutations]);

  const hasNoForms = dashboard.forms.length === 0;
  const hasNoResults = dashboard.forms.length > 0 && dashboard.visibleForms.length === 0;

  return (
    <div className="min-h-screen bg-page text-primary flex flex-col">
      <DashboardTopbar onCreateForm={dashboard.openCreateDialog} />
      <motion.main
        className="mx-auto w-full max-w-[1440px] flex-1 space-y-8 px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
      >
        {dashboard.loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <DashboardHeader totalForms={dashboard.forms.length} />
            <DashboardControls
              activeFilter={dashboard.activeFilter}
              searchQuery={dashboard.searchQuery}
              sortOption={dashboard.sortOption}
              onFilterChange={dashboard.setActiveFilter}
              onSearchChange={dashboard.setSearchQuery}
              onSortChange={dashboard.setSortOption}
            />
            {dashboard.error ? (
              <DashboardErrorState
                message={dashboard.error}
                onRetry={dashboard.retry}
              />
            ) : null}
            {!dashboard.error && hasNoForms ? (
              <DashboardEmptyState
                type="no_forms"
                onCreateForm={dashboard.openCreateDialog}
                onClearFilters={dashboard.clearFilters}
              />
            ) : null}
            {!dashboard.error && hasNoResults ? (
              <DashboardEmptyState
                type="no_results"
                onCreateForm={dashboard.openCreateDialog}
                onClearFilters={dashboard.clearFilters}
              />
            ) : null}
            {!dashboard.error && dashboard.visibleForms.length > 0 ? (
              <FormsGrid
                forms={dashboard.visibleForms}
                pendingFormIds={pendingFormIds}
                onAnalytics={(form_id) => {
                  const route = getAnalyticsRoute(form_id);

                  if (route) {
                    router.push(route);
                  }
                }}
                onCopyPublicLink={(form) => {
                  void dashboard.handleCopyPublicLink(form);
                }}
                onDelete={dashboard.openDeleteDialog}
                onDuplicate={(form_id) => {
                  void dashboard.handleDuplicateForm(form_id);
                }}
                onOpen={(form_id) => router.push(`/builder/${form_id}`)}
                onRename={dashboard.openRenameDialog}
                onResponses={(form_id) => {
                  const route = getResponsesRoute(form_id);

                  if (route) {
                    router.push(route);
                  }
                }}
                onTogglePublish={(form) => {
                  void dashboard.handleTogglePublish(form);
                }}
              />
            ) : null}
          </>
        )}
      </motion.main>
      <FormDialog
        mode="create"
        open={dashboard.dialog === "create"}
        pending={dashboard.pendingMutations.create === true}
        onClose={dashboard.closeDialog}
        onSubmit={dashboard.handleCreateForm}
      />
      <FormDialog
        mode="rename"
        open={dashboard.dialog === "rename"}
        form={dashboard.selectedForm}
        pending={
          typeof dashboard.pendingMutations.rename === "number" &&
          dashboard.pendingMutations.rename === dashboard.selectedForm?.id
        }
        onClose={dashboard.closeDialog}
        onSubmit={(title) =>
          dashboard.selectedForm
            ? dashboard.handleRenameForm(dashboard.selectedForm.id, title)
            : Promise.resolve()
        }
      />
      <DeleteFormDialog
        open={dashboard.dialog === "delete"}
        form={dashboard.selectedForm}
        pending={
          typeof dashboard.pendingMutations.delete === "number" &&
          dashboard.pendingMutations.delete === dashboard.selectedForm?.id
        }
        onClose={dashboard.closeDialog}
        onDelete={dashboard.handleDeleteForm}
      />
    </div>
  );
}
