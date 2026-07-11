"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { evaluateLogicRules, getNextQuestionId } from "@/features/logic/rules";
import { createDraft, deleteDraft, getDraft, updateDraft } from "@/services/drafts.api";
import { getPublicForm, submitResponse } from "@/services/public.api";
import type { DraftResponse } from "@/types/draft";
import type { PublicForm } from "@/types/form";
import type { ResponseAnswer } from "@/types/response";
import { getErrorMessage } from "@/lib/getErrorMessage";

import {
  type AnswerMap,
  type AnswerValue,
  buildResponseAnswers,
  getCompletedQuestionCount,
  validateAnswer,
} from "../utils/answers";

type DraftSaveStatus = "idle" | "saving" | "saved" | "error";



function answersToMap(answers: ResponseAnswer[]): AnswerMap {
  return Object.fromEntries(answers.map((answer) => [answer.question_id, answer.value]));
}

function mapToDraftAnswers(answers: AnswerMap): ResponseAnswer[] {
  return Object.entries(answers).map(([question_id, value]) => ({
    question_id: Number(question_id),
    value: value ?? null,
  }));
}

export function useRespondentFlow(slug: string) {
  const [form, setForm] = useState<PublicForm | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [visitedQuestionIds, setVisitedQuestionIds] = useState<number[]>([]);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [resumeDraft, setResumeDraft] = useState<DraftResponse | null>(null);
  const [draftSaveStatus, setDraftSaveStatus] = useState<DraftSaveStatus>("idle");
  const [draftDirtyVersion, setDraftDirtyVersion] = useState(0);
  const [errors, setErrors] = useState<Record<number, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [startedAtIso, setStartedAtIso] = useState(() => new Date().toISOString());
  const lastSavedPayloadRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const autosaveTimeoutRef = useRef<number | null>(null);
  const submittedRef = useRef(false);

  const questions = useMemo(
    () => form?.questions.toSorted((a, b) => a.position - b.position) ?? [],
    [form?.questions],
  );
  const currentIndex = currentQuestionId
    ? Math.max(0, questions.findIndex((question) => question.id === currentQuestionId))
    : 0;
  const currentQuestion = questions[currentIndex] ?? null;
  const completedCount = getCompletedQuestionCount(questions, answers);
  const progressPercent =
    questions.length === 0 ? 0 : Math.round((completedCount / questions.length) * 100);

  const loadForm = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    submittedRef.current = false;

    try {
      const response = await getPublicForm(slug);
      const orderedQuestions = response.data.questions.toSorted(
        (a, b) => a.position - b.position,
      );
      setForm({
        ...response.data,
        questions: orderedQuestions,
      });
      setCurrentQuestionId(orderedQuestions[0]?.id ?? null);
      setVisitedQuestionIds(orderedQuestions[0] ? [orderedQuestions[0].id] : []);
      setAnswers({});
      setErrors({});
      setSubmitted(false);
      setDraft(null);
      setResumeDraft(null);
      setDraftSaveStatus("idle");
      lastSavedPayloadRef.current = null;

      const draftResponse = await getDraft(slug);
      const existingDraft = draftResponse.data;

      if (existingDraft && !existingDraft.completed) {
        setResumeDraft(existingDraft);
      }
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  function setAnswer(question_id: number, value: AnswerValue) {
    setAnswers((current) => ({
      ...current,
      [question_id]: value,
    }));
    setErrors((current) => ({
      ...current,
      [question_id]: null,
    }));
    setVisitedQuestionIds((current) => {
      const currentPosition = questions.find((question) => question.id === question_id)?.position;

      if (currentPosition === undefined) {
        return current;
      }

      return current.filter((visitedId) => {
        const visitedPosition = questions.find((question) => question.id === visitedId)?.position;
        return visitedPosition === undefined || visitedPosition <= currentPosition;
      });
    });
    setDraftDirtyVersion((current) => current + 1);
  }

  const restoreDraft = useCallback((draftToRestore: DraftResponse) => {
    setDraft(draftToRestore);
    setResumeDraft(null);
    setAnswers(answersToMap(draftToRestore.answers));
    setCurrentQuestionId(draftToRestore.current_question_id);
    setVisitedQuestionIds([...draftToRestore.visited_question_ids]);
    setStartedAt(new Date(draftToRestore.started_at).getTime());
    setStartedAtIso(draftToRestore.started_at);
    lastSavedPayloadRef.current = JSON.stringify({
      answers: draftToRestore.answers,
      current_question_id: draftToRestore.current_question_id,
      visited_question_ids: draftToRestore.visited_question_ids,
      started_at: draftToRestore.started_at,
      form_version: draftToRestore.form_version,
    });
  }, []);

  const startOver = useCallback(async () => {
    const draftToDelete = resumeDraft ?? draft;

    if (draftToDelete) {
      await deleteDraft(draftToDelete.id);
    }

    const firstQuestionId = questions[0]?.id ?? null;
    const now = Date.now();
    setDraft(null);
    setResumeDraft(null);
    setAnswers({});
    setErrors({});
    setCurrentQuestionId(firstQuestionId);
    setVisitedQuestionIds(firstQuestionId ? [firstQuestionId] : []);
    setStartedAt(now);
    setStartedAtIso(new Date(now).toISOString());
    setDraftSaveStatus("idle");
    lastSavedPayloadRef.current = null;
  }, [draft, questions, resumeDraft]);

  const validateQuestionAt = useCallback(
    (index: number) => {
      const question = questions[index];

      if (!question) {
        return true;
      }

      const error = validateAnswer(question, answers[question.id]);
      setErrors((current) => ({
        ...current,
        [question.id]: error,
      }));

      return error === null;
    },
    [answers, questions],
  );

  const goPrevious = useCallback(() => {
    setVisitedQuestionIds((current) => {
      if (current.length <= 1) {
        return current;
      }

      const nextHistory = current.slice(0, -1);
      setCurrentQuestionId(nextHistory[nextHistory.length - 1] ?? null);
      return nextHistory;
    });
  }, []);

  const moveToQuestion = useCallback((question_id: number) => {
    setCurrentQuestionId(question_id);
    setVisitedQuestionIds((current) =>
      current[current.length - 1] === question_id ? current : [...current, question_id],
    );
    setDraftDirtyVersion((current) => current + 1);
  }, []);

  const goNext = useCallback(() => {
    const currentQuestionForLogic = currentQuestion;

    if (!currentQuestionForLogic) {
      return null;
    }

    if (!validateQuestionAt(currentIndex)) {
      return null;
    }

    const logicResult = evaluateLogicRules({
      answer: answers[currentQuestionForLogic.id],
      current_question: currentQuestionForLogic,
      questions,
      rules: form?.logic_rules ?? [],
    });

    if (logicResult?.action === "submit_form") {
      return "submit";
    }

    const nextQuestionId =
      logicResult?.action === "go_to_question"
        ? logicResult.target_question_id
        : getNextQuestionId(currentQuestionForLogic.id, questions);

    if (nextQuestionId === null) {
      return "submit";
    }

    moveToQuestion(nextQuestionId);
    return "next";
  }, [answers, currentIndex, currentQuestion, form?.logic_rules, moveToQuestion, questions, validateQuestionAt]);

  const submit = useCallback(async () => {
    if (!form || submitting) {
      return;
    }

    const nextErrors: Record<number, string | null> = {};
    let valid = true;

    const visitedQuestions = questions.filter((question) => visitedQuestionIds.includes(question.id));

    for (const question of visitedQuestions) {
      const error = validateAnswer(question, answers[question.id]);
      nextErrors[question.id] = error;

      if (error) {
        valid = false;
      }
    }

    setErrors(nextErrors);

    if (!valid) {
      const firstInvalid = visitedQuestions.find((question) => nextErrors[question.id]);
      setCurrentQuestionId(firstInvalid?.id ?? visitedQuestions[0]?.id ?? questions[0]?.id ?? null);
      return;
    }

    setSubmitting(true);

    try {
      const responseAnswers: ResponseAnswer[] = buildResponseAnswers(questions, answers);
      await submitResponse(slug, {
        answers: responseAnswers,
        completion_time_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
        form_version: form.version,
      });

      submittedRef.current = true;
      if (autosaveTimeoutRef.current !== null) {
        window.clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }

      setDraft(null);
      setResumeDraft(null);
      setDraftSaveStatus("idle");
      lastSavedPayloadRef.current = null;
      setSubmitted(true);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [answers, form, questions, slug, startedAt, submitting, visitedQuestionIds]);

  const goForwardOrSubmit = useCallback(() => {
    const result = goNext();

    if (result === "submit") {
      void submit();
    }
  }, [goNext, submit]);

  useEffect(() => {
    if (!form || !currentQuestionId || resumeDraft || submitted || questions.length === 0) {
      return;
    }

    if (draftDirtyVersion === 0) {
      return;
    }

    const payload = {
      answers: mapToDraftAnswers(answers),
      current_question_id: currentQuestionId,
      visited_question_ids: visitedQuestionIds.length > 0 ? visitedQuestionIds : [currentQuestionId],
      started_at: startedAtIso,
      form_version: form.version,
    };
    const serializedPayload = JSON.stringify(payload);

    if (serializedPayload === lastSavedPayloadRef.current || savingRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      autosaveTimeoutRef.current = null;

      async function saveDraft() {
        if (submittedRef.current) {
          return;
        }

        savingRef.current = true;
        setDraftSaveStatus("saving");

        try {
          const activeDraft = draft ?? (await createDraft(slug)).data;
          if (submittedRef.current) {
            return;
          }

          const response = await updateDraft(activeDraft.id, {
            ...payload,
            completed: false,
          });
          if (submittedRef.current) {
            return;
          }

          setDraft(response.data);
          lastSavedPayloadRef.current = serializedPayload;
          setDraftSaveStatus("saved");
        } catch {
          setDraftSaveStatus("error");
        } finally {
          savingRef.current = false;
        }
      }

      void saveDraft();
    }, 900);
    autosaveTimeoutRef.current = timeoutId;

    return () => {
      window.clearTimeout(timeoutId);
      if (autosaveTimeoutRef.current === timeoutId) {
        autosaveTimeoutRef.current = null;
      }
    };
  }, [
    answers,
    currentQuestionId,
    draft,
    draftDirtyVersion,
    form,
    questions.length,
    resumeDraft,
    slug,
    startedAtIso,
    submitted,
    visitedQuestionIds,
  ]);

  return {
    answers,
    canGoPrevious: visitedQuestionIds.length > 1,
    completedCount,
    currentIndex,
    currentQuestion,
    draftSaveStatus,
    errors,
    form,
    goForwardOrSubmit,
    goNext,
    goPrevious,
    loadError,
    loading,
    progressPercent,
    questions,
    retry: loadForm,
    resumeDraft,
    restoreDraft,
    setAnswer,
    startOver,
    submitted,
    submitting,
    submit,
  };
}
