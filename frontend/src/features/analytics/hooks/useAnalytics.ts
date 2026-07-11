"use client";

import { useCallback, useEffect, useState } from "react";

import { getAnalytics } from "@/services/analytics.api";
import type { FormAnalytics } from "@/types/analytics";

export function useAnalytics(formId: number) {
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAnalytics(formId);
      setAnalytics(response.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analytics could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    error,
    loading,
    retry: loadAnalytics,
  };
}
