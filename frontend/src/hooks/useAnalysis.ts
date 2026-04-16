"use client";

import { useState, useCallback } from "react";
import { analyzeQuery } from "@/lib/api";
import type { AnalyzeRequest, AnalysisState } from "@/types/analysis";

const INITIAL_STATE: AnalysisState = {
  status: "idle",
  result: null,
  error: null,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL_STATE);

  const analyze = useCallback(async (request: AnalyzeRequest) => {
    setState({ status: "loading", result: null, error: null });

    try {
      const result = await analyzeQuery(request);
      setState({ status: "success", result, error: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      setState({ status: "error", result: null, error: message });
    }
  }, []);

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    analyze,
    reset,
  };
}
