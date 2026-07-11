import { create } from "zustand";

import type { Form } from "@/types/form";
import type { LogicRule } from "@/types/logic";
import type { Question } from "@/types/question";
import type { FormTheme } from "@/types/theme";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface BuilderState {
  selected_question_id: number | null;
  questions: Question[];
  logic_rules: LogicRule[];
  form: Form | null;
  dirty: boolean;
  loading: boolean;
  error: string | null;
  save_status: SaveStatus;
  selectQuestion: (selected_question_id: number | null) => void;
  setQuestions: (questions: Question[]) => void;
  setLogicRules: (logic_rules: LogicRule[]) => void;
  setTheme: (theme: FormTheme) => void;
  setForm: (form: Form | null) => void;
  addQuestion: (question: Question) => void;
  updateQuestion: (question: Question) => void;
  removeQuestion: (question_id: number) => void;
  reorderQuestions: (questions: Question[]) => void;
  addLogicRule: (rule: LogicRule) => void;
  updateLogicRule: (rule: LogicRule) => void;
  removeLogicRule: (rule_id: number) => void;
  reorderLogicRules: (logic_rules: LogicRule[]) => void;
  setDirty: (dirty: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSaveStatus: (save_status: SaveStatus) => void;
  resetBuilder: () => void;
}

const initialState = {
  selected_question_id: null,
  questions: [],
  logic_rules: [],
  form: null,
  dirty: false,
  loading: false,
  error: null,
  save_status: "idle" as SaveStatus,
};

function syncFormQuestions(form: Form | null, questions: Question[]) {
  if (!form) {
    return null;
  }

  return {
    ...form,
    questions,
    question_count: questions.length,
  };
}

function syncFormLogicRules(form: Form | null, logic_rules: LogicRule[]) {
  if (!form) {
    return null;
  }

  return {
    ...form,
    logic_rules,
  };
}

function orderedQuestions(questions: Question[]) {
  return questions.toSorted((a, b) => a.position - b.position);
}

function orderedRules(logic_rules: LogicRule[]) {
  return logic_rules.toSorted((a, b) => a.priority - b.priority);
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...initialState,
  selectQuestion: (selected_question_id) => set({ selected_question_id }),
  setQuestions: (questions) => {
    const ordered = orderedQuestions(questions);
    set((state) => ({
      questions: ordered,
      form: syncFormQuestions(state.form, ordered),
    }));
  },
  setLogicRules: (logic_rules) => {
    const ordered = orderedRules(logic_rules);
    set((state) => ({
      logic_rules: ordered,
      form: syncFormLogicRules(state.form, ordered),
    }));
  },
  setTheme: (theme) =>
    set((state) => ({
      form: state.form ? { ...state.form, theme } : state.form,
      dirty: false,
    })),
  setForm: (form) => {
    const questions = orderedQuestions(form?.questions ?? []);
    const logic_rules = orderedRules(form?.logic_rules ?? []);
    set({
      form: form ? syncFormLogicRules(syncFormQuestions(form, questions), logic_rules) : null,
      questions,
      logic_rules,
      selected_question_id: questions[0]?.id ?? null,
      error: null,
    });
  },
  addQuestion: (question) => {
    const questions = orderedQuestions([...get().questions, question]);
    set((state) => ({
      questions,
      form: syncFormQuestions(state.form, questions),
      selected_question_id: question.id,
      dirty: false,
    }));
  },
  updateQuestion: (question) => {
    const questions = orderedQuestions(
      get().questions.map((item) => (item.id === question.id ? question : item)),
    );
    set((state) => ({
      questions,
      form: syncFormQuestions(state.form, questions),
      dirty: false,
    }));
  },
  removeQuestion: (question_id) => {
    const previousQuestions = get().questions;
    const deletedIndex = previousQuestions.findIndex((question) => question.id === question_id);
    const questions = orderedQuestions(
      previousQuestions
        .filter((question) => question.id !== question_id)
        .map((question, index) => ({
          ...question,
          position: index + 1,
        })),
    );
    const logic_rules = orderedRules(
      get().logic_rules
        .filter((rule) => rule.source_question_id !== question_id && rule.target_question_id !== question_id)
        .map((rule, index) => ({ ...rule, priority: index })),
    );
    const nextSelected =
      questions[deletedIndex]?.id ?? questions[deletedIndex - 1]?.id ?? questions[0]?.id ?? null;

    set((state) => ({
      questions,
      logic_rules,
      form: syncFormLogicRules(syncFormQuestions(state.form, questions), logic_rules),
      selected_question_id: nextSelected,
      dirty: false,
    }));
  },
  reorderQuestions: (questions) => {
    const normalized = questions.map((question, index) => ({
      ...question,
      position: index + 1,
    }));

    set((state) => ({
      questions: normalized,
      form: syncFormQuestions(state.form, normalized),
      dirty: false,
    }));
  },
  addLogicRule: (rule) => {
    const logic_rules = orderedRules([...get().logic_rules, rule]);
    set((state) => ({
      logic_rules,
      form: syncFormLogicRules(state.form, logic_rules),
      dirty: false,
    }));
  },
  updateLogicRule: (rule) => {
    const logic_rules = orderedRules(
      get().logic_rules.map((item) => (item.id === rule.id ? rule : item)),
    );
    set((state) => ({
      logic_rules,
      form: syncFormLogicRules(state.form, logic_rules),
      dirty: false,
    }));
  },
  removeLogicRule: (rule_id) => {
    const logic_rules = orderedRules(
      get().logic_rules
        .filter((rule) => rule.id !== rule_id)
        .map((rule, index) => ({ ...rule, priority: index })),
    );
    set((state) => ({
      logic_rules,
      form: syncFormLogicRules(state.form, logic_rules),
      dirty: false,
    }));
  },
  reorderLogicRules: (logic_rules) => {
    const normalized = logic_rules.map((rule, index) => ({ ...rule, priority: index }));
    set((state) => ({
      logic_rules: normalized,
      form: syncFormLogicRules(state.form, normalized),
      dirty: false,
    }));
  },
  setDirty: (dirty) => set({ dirty }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSaveStatus: (save_status) => set({ save_status }),
  resetBuilder: () => set(initialState),
}));
