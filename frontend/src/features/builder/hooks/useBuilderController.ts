"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getForm, publishForm, unpublishForm, updateForm } from "@/services/forms.api";
import {
  createLogicRule,
  deleteLogicRule,
  reorderLogicRules as reorderLogicRulesService,
  updateLogicRule,
} from "@/services/logicRules.api";
import {
  createQuestion,
  deleteQuestion,
  reorderQuestions as reorderQuestionsService,
} from "@/services/questions.api";
import { resetTheme, updateTheme } from "@/services/themes.api";
import { useBuilderStore } from "@/stores/builder.store";
import type { Form } from "@/types/form";
import type { CreateLogicRulePayload, LogicRule, UpdateLogicRulePayload } from "@/types/logic";
import type { Question, QuestionType } from "@/types/question";
import type { FormTheme, UpdateThemePayload } from "@/types/theme";

import type { BuilderMobileTab, BuilderSidePanel } from "../types";
import { getPublicFormUrl } from "../utils/publicUrl";
import { createDefaultQuestionPayload } from "../utils/questionTypes";

import { getErrorMessage } from "@/lib/getErrorMessage";

function mergeTheme(theme: FormTheme, payload: UpdateThemePayload): FormTheme {
  return {
    ...theme,
    ...payload,
    colors: { ...theme.colors, ...payload.colors },
    typography: { ...theme.typography, ...payload.typography },
    background: { ...theme.background, ...payload.background },
    buttons: { ...theme.buttons, ...payload.buttons },
    inputs: { ...theme.inputs, ...payload.inputs },
  };
}

export function useBuilderController(formId: number) {
  const router = useRouter();
  const store = useBuilderStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [mobileTab, setMobileTab] = useState<BuilderMobileTab>("questions");
  const [sidePanel, setSidePanel] = useState<BuilderSidePanel>("settings");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const selectedQuestion = useMemo(
    () =>
      store.questions.find((question) => question.id === store.selected_question_id) ??
      null,
    [store.questions, store.selected_question_id],
  );

  const loadForm = useCallback(async () => {
    const builderStore = useBuilderStore.getState();
    builderStore.setLoading(true);
    builderStore.setError(null);

    try {
      const response = await getForm(formId);
      useBuilderStore.getState().setForm({
        ...response.data,
        questions: response.data.questions.toSorted((a, b) => a.position - b.position),
      });
    } catch (error) {
      useBuilderStore.getState().setError(getErrorMessage(error));
    } finally {
      useBuilderStore.getState().setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void loadForm();

    return () => useBuilderStore.getState().resetBuilder();
  }, [loadForm]);

  const handleUpdateForm = useCallback(
    (form: Form) => {
      store.setForm({
        ...form,
        questions: form.questions.length > 0 ? form.questions : store.questions,
      });
    },
    [store],
  );

  const saveFormTitle = useCallback(
    async (title: string) => {
      const trimmedTitle = title.trim();

      if (!store.form || !trimmedTitle || trimmedTitle === store.form.title) {
        return;
      }

      store.setSaveStatus("saving");

      try {
        const response = await updateForm(store.form.id, { title: trimmedTitle });
        handleUpdateForm(response.data);
        store.setSaveStatus("saved");
        window.setTimeout(() => store.setSaveStatus("idle"), 1300);
      } catch (error) {
        store.setSaveStatus("error");
        toast.error(getErrorMessage(error));
      }
    },
    [handleUpdateForm, store],
  );

  const addQuestion = useCallback(
    async (type: QuestionType) => {
      if (!store.form) {
        return;
      }

      setPendingAction("add");

      try {
        const response = await createQuestion(
          store.form.id,
          createDefaultQuestionPayload(type, store.questions.length + 1),
        );
        store.addQuestion(response.data);
        store.setSaveStatus("saved");
        setMobileTab("edit");
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    },
    [store],
  );

  const deleteSelectedQuestion = useCallback(async () => {
    if (!deleteTarget) {
      return;
    }

    setPendingAction("delete");

    try {
      await deleteQuestion(deleteTarget.id);
      const removedRuleCount = store.logic_rules.filter(
        (rule) =>
          rule.source_question_id === deleteTarget.id ||
          rule.target_question_id === deleteTarget.id,
      ).length;
      store.removeQuestion(deleteTarget.id);
      toast.success("Question deleted.");
      if (removedRuleCount > 0) {
        toast.info(`${removedRuleCount} related logic rule${removedRuleCount === 1 ? "" : "s"} removed.`);
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }, [deleteTarget, store]);

  const reorderQuestions = useCallback(
    async (questions: Question[]) => {
      if (!store.form) {
        return;
      }

      const previousQuestions = store.questions;
      store.reorderQuestions(questions);
      store.setSaveStatus("saving");

      try {
        await reorderQuestionsService(store.form.id, {
          question_ids: questions.map((question) => question.id),
        });
        store.setSaveStatus("saved");
        window.setTimeout(() => store.setSaveStatus("idle"), 1300);
      } catch (error) {
        store.reorderQuestions(previousQuestions);
        store.setSaveStatus("error");
        toast.error(getErrorMessage(error));
      }
    },
    [store],
  );

  const addLogicRule = useCallback(
    async (payload: CreateLogicRulePayload) => {
      if (!store.form) {
        return;
      }

      setPendingAction("logic");

      try {
        const response = await createLogicRule(store.form.id, payload);
        store.addLogicRule(response.data);
        store.setSaveStatus("saved");
        toast.success("Logic rule added.");
      } catch (error) {
        store.setSaveStatus("error");
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    },
    [store],
  );

  const saveLogicRule = useCallback(
    async (rule_id: number, payload: UpdateLogicRulePayload) => {
      setPendingAction("logic");

      try {
        const response = await updateLogicRule(rule_id, payload);
        store.updateLogicRule(response.data);
        store.setSaveStatus("saved");
        toast.success("Logic rule saved.");
      } catch (error) {
        store.setSaveStatus("error");
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    },
    [store],
  );

  const removeLogicRule = useCallback(
    async (rule_id: number) => {
      setPendingAction("logic");

      try {
        await deleteLogicRule(rule_id);
        store.removeLogicRule(rule_id);
        toast.success("Logic rule deleted.");
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    },
    [store],
  );

  const reorderLogicRules = useCallback(
    async (rules: LogicRule[]) => {
      if (!store.form) {
        return;
      }

      const previousRules = store.logic_rules;
      store.reorderLogicRules(rules);
      store.setSaveStatus("saving");

      try {
        await reorderLogicRulesService(store.form.id, {
          rule_ids: rules.map((rule) => rule.id),
        });
        store.setSaveStatus("saved");
      } catch (error) {
        store.reorderLogicRules(previousRules);
        store.setSaveStatus("error");
        toast.error(getErrorMessage(error));
      }
    },
    [store],
  );

  const saveTheme = useCallback(
    async (payload: UpdateThemePayload) => {
      if (!store.form) {
        return;
      }

      const previousTheme = store.form.theme;
      store.setTheme(mergeTheme(previousTheme, payload));
      store.setSaveStatus("saving");

      try {
        const response = await updateTheme(store.form.id, payload);
        store.setTheme(response.data);
        store.setSaveStatus("saved");
        window.setTimeout(() => store.setSaveStatus("idle"), 1300);
      } catch (error) {
        store.setTheme(previousTheme);
        store.setSaveStatus("error");
        toast.error(getErrorMessage(error));
      }
    },
    [store],
  );

  const restoreDefaultTheme = useCallback(async () => {
    if (!store.form) {
      return;
    }

    setPendingAction("theme");
    store.setSaveStatus("saving");

    try {
      const response = await resetTheme(store.form.id);
      store.setTheme(response.data);
      store.setSaveStatus("saved");
      toast.success("Theme reset.");
    } catch (error) {
      store.setSaveStatus("error");
      toast.error(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }, [store]);

  const togglePublish = useCallback(async () => {
    if (!store.form) {
      return;
    }

    setPendingAction("publish");

    try {
      const response =
        store.form.status === "published"
          ? await unpublishForm(store.form.id)
          : await publishForm(store.form.id);

      await loadForm();
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }, [handleUpdateForm, store.form, loadForm]);

  const copyPublicLink = useCallback(async () => {
    if (!store.form) {
      return;
    }

    const publicUrl = getPublicFormUrl(store.form);

    if (!publicUrl) {
      toast.error("Publish this form before copying a public link.");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success("Public link copied.");
    } catch {
      toast.error("Could not copy the public link.");
    }
  }, [store.form]);

  return {
    ...store,
    addQuestion,
    addLogicRule,
    copyPublicLink,
    deleteSelectedQuestion,
    deleteTarget,
    loadForm,
    mobileTab,
    pendingAction,
    previewOpen,
    removeLogicRule,
    router,
    reorderLogicRules,
    reorderQuestions,
    restoreDefaultTheme,
    saveFormTitle,
    saveTheme,
    saveLogicRule,
    selectedQuestion,
    setDeleteTarget,
    setMobileTab,
    setSidePanel,
    setPreviewOpen,
    sidePanel,
    togglePublish,
  };
}
