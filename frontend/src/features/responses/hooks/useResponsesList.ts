"use client";

import { useCallback, useEffect, useState } from "react";

import { getResponses } from "@/services/responses.api";
import type { FormResponsesData } from "@/types/response";

export function useResponsesList(formId: number) {
  const [data, setData] = useState<FormResponsesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResponses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getResponses(formId);
      setData(response.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Responses could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    void loadResponses();
  }, [loadResponses]);

  return {
    data,
    error,
    loading,
    retry: loadResponses,
  };
}
