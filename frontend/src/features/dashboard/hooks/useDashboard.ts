"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createForm,
  deleteForm,
  duplicateForm,
  getForms,
  publishForm,
  unpublishForm,
  updateForm,
} from "@/services/forms.api";
import type { Form } from "@/types/form";

import type { DashboardDialog, DashboardFilter, DashboardSort } from "../types";
import { getPublicFormUrl, getVisibleForms } from "../utils/forms";
import { getErrorMessage } from "@/lib/getErrorMessage";

type MutationKey =
  | "create"
  | "rename"
  | "delete"
  | "duplicate"
  | "publish"
  | "unpublish"
  | "copy";

type PendingMutations = Partial<Record<MutationKey, number | boolean>>;

export function useDashboard() {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>([]);
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<DashboardSort>("recently_updated");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DashboardDialog>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [pendingMutations, setPendingMutations] = useState<PendingMutations>({});

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getForms();
      setForms(response.data.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  const visibleForms = useMemo(
    () => getVisibleForms(forms, searchQuery, activeFilter, sortOption),
    [activeFilter, forms, searchQuery, sortOption],
  );

  const setPending = useCallback((key: MutationKey, value: number | boolean | null) => {
    setPendingMutations((current) => {
      const next = { ...current };

      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }

      return next;
    });
  }, []);

  const openCreateDialog = useCallback(() => {
    setSelectedForm(null);
    setDialog("create");
  }, []);

  const openRenameDialog = useCallback((form: Form) => {
    setSelectedForm(form);
    setDialog("rename");
  }, []);

  const openDeleteDialog = useCallback((form: Form) => {
    setSelectedForm(form);
    setDialog("delete");
  }, []);

  const closeDialog = useCallback(() => {
    setDialog(null);
    setSelectedForm(null);
  }, []);

  const handleCreateForm = useCallback(
    async (title: string) => {
      setPending("create", true);

      try {
        const response = await createForm({
          title,
          description: null,
        });

        setForms((current) => [response.data, ...current]);
        toast.success(response.message);
        closeDialog();
        router.push(`/builder/${response.data.id}`);
      } catch (requestError) {
        toast.error(getErrorMessage(requestError));
      } finally {
        setPending("create", null);
      }
    },
    [closeDialog, router, setPending],
  );

  const handleRenameForm = useCallback(
    async (form_id: number, title: string) => {
      setPending("rename", form_id);

      try {
        const response = await updateForm(form_id, { title });
        setForms((current) =>
          current.map((form) => (form.id === form_id ? response.data : form)),
        );
        toast.success(response.message);
        closeDialog();
      } catch (requestError) {
        toast.error(getErrorMessage(requestError));
      } finally {
        setPending("rename", null);
      }
    },
    [closeDialog, setPending],
  );

  const handleDeleteForm = useCallback(
    async (form_id: number) => {
      setPending("delete", form_id);

      try {
        const response = await deleteForm(form_id);
        setForms((current) => current.filter((form) => form.id !== form_id));
        toast.success(response.message);
        closeDialog();
      } catch (requestError) {
        toast.error(getErrorMessage(requestError));
      } finally {
        setPending("delete", null);
      }
    },
    [closeDialog, setPending],
  );

  const handleDuplicateForm = useCallback(
    async (form_id: number) => {
      setPending("duplicate", form_id);

      try {
        const response = await duplicateForm(form_id);
        setForms((current) => [response.data, ...current]);
        toast.success(response.message);
      } catch (requestError) {
        toast.error(getErrorMessage(requestError));
      } finally {
        setPending("duplicate", null);
      }
    },
    [setPending],
  );

  const handleTogglePublish = useCallback(
    async (form: Form) => {
      const key = form.status === "published" ? "unpublish" : "publish";
      setPending(key, form.id);

      try {
        const response =
          form.status === "published"
            ? await unpublishForm(form.id)
            : await publishForm(form.id);

        await loadForms();
        toast.success(response.message);
      } catch (requestError) {
        toast.error(getErrorMessage(requestError));
      } finally {
        setPending(key, null);
      }
    },
    [loadForms, setPending],
  );

  const handleCopyPublicLink = useCallback(
    async (form: Form) => {
      const publicUrl = getPublicFormUrl(form);

      if (!publicUrl) {
        toast.error("This form does not have a public link yet.");
        return;
      }

      setPending("copy", form.id);

      try {
        await navigator.clipboard.writeText(publicUrl);
        toast.success("Public link copied.");
      } catch {
        toast.error("Could not copy the public link.");
      } finally {
        setPending("copy", null);
      }
    },
    [setPending],
  );

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setActiveFilter("all");
    setSortOption("recently_updated");
  }, []);

  return {
    activeFilter,
    clearFilters,
    closeDialog,
    dialog,
    error,
    forms,
    handleCopyPublicLink,
    handleCreateForm,
    handleDeleteForm,
    handleDuplicateForm,
    handleRenameForm,
    handleTogglePublish,
    loading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    pendingMutations,
    retry: loadForms,
    searchQuery,
    selectedForm,
    setActiveFilter,
    setSearchQuery,
    setSortOption,
    sortOption,
    visibleForms,
  };
}
