import { mockForms } from "./data.ts";
import type { Form } from "@/types/form";
import type { LogicRule } from "@/types/logic";
import type { Question } from "@/types/question";
import type { FormTheme } from "@/types/theme";

let forms: Form[] = mockForms.map(cloneForm);

export function cloneQuestion(question: Question): Question {
  return {
    ...question,
    settings: {
      ...question.settings,
      options: question.settings.options ? [...question.settings.options] : undefined,
    },
  };
}

export function cloneLogicRule(rule: LogicRule): LogicRule {
  return { ...rule };
}

export function cloneTheme(theme: FormTheme): FormTheme {
  return {
    ...theme,
    colors: { ...theme.colors },
    typography: { ...theme.typography },
    background: { ...theme.background },
    buttons: { ...theme.buttons },
    inputs: { ...theme.inputs },
  };
}

export function cloneForm(form: Form): Form {
  return {
    ...form,
    questions: form.questions.map(cloneQuestion),
    logic_rules: form.logic_rules.map(cloneLogicRule),
    theme: cloneTheme(form.theme),
  };
}

export function getStoredForms() {
  return forms.map(cloneForm);
}

export function findStoredForm(form_id: number) {
  const form = forms.find((item) => item.id === form_id);

  if (!form) {
    throw new Error("Form not found.");
  }

  return form;
}

export function findStoredQuestion(question_id: number) {
  for (const form of forms) {
    const question = form.questions.find((item) => item.id === question_id);

    if (question) {
      return { form, question };
    }
  }

  throw new Error("Question not found.");
}

export function findAllStoredQuestions() {
  return forms.flatMap((form) => form.questions.map(cloneQuestion));
}

export function findAllStoredLogicRules() {
  return forms.flatMap((form) => form.logic_rules.map(cloneLogicRule));
}

export function findStoredLogicRule(rule_id: number) {
  for (const form of forms) {
    const rule = form.logic_rules.find((item) => item.id === rule_id);

    if (rule) {
      return { form, rule };
    }
  }

  throw new Error("Logic rule not found.");
}

export function replaceStoredForm(form_id: number, updater: (form: Form) => Form) {
  let updatedForm = findStoredForm(form_id);

  forms = forms.map((form) => {
    if (form.id !== form_id) {
      return form;
    }

    updatedForm = updater(form);
    return updatedForm;
  });

  return cloneForm(updatedForm);
}

export function prependStoredForm(form: Form) {
  forms = [form, ...forms];
  return cloneForm(form);
}

export function removeStoredForm(form_id: number) {
  findStoredForm(form_id);
  forms = forms.filter((form) => form.id !== form_id);
}

export function resetStoredFormsForTests() {
  forms = mockForms.map(cloneForm);
}

export function normalizeQuestions(questions: Question[]) {
  return questions
    .toSorted((a, b) => a.position - b.position)
    .map((question, index) => ({
      ...question,
      position: index,
    }));
}

export function normalizeLogicRules(rules: LogicRule[]) {
  return rules
    .toSorted((a, b) => a.priority - b.priority)
    .map((rule, index) => ({
      ...rule,
      priority: index,
    }));
}
