"use client";

import { useCallback, useEffect, useState } from "react";

import { getResponse } from "@/services/responses.api";
import type { FormResponseDetail } from "@/types/response";

export function useResponseDetail(responseId: number) {
  const [response, setResponse] = useState<FormResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResponse = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getResponse(responseId);
      setResponse(result.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Response could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [responseId]);

  useEffect(() => {
    void loadResponse();
  }, [loadResponse]);

  return {
    error,
    loading,
    response,
    retry: loadResponse,
  };
}
