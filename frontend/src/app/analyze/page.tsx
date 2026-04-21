"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InputPanel } from "@/components/input/InputPanel";
import { ResultPanel } from "@/components/results/ResultPanel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useDetectedTables } from "@/hooks/useDetectedTables";
import type { AnalyzeRequest } from "@/types/analysis";

export default function AnalyzePage() {
  const { status, result, error, isLoading, analyze, reset } = useAnalysis();
  const { detectedTables, updateTables } = useDetectedTables();
  const [lastSql, setLastSql] = useState("");

  async function handleSubmit(request: AnalyzeRequest) {
    setLastSql(request.sql);
    await analyze(request);
  }

  if (result && result.detected_tables.length > 0 && detectedTables.length === 0) {
    updateTables(result.detected_tables);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <header className="shrink-0 border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Velox<span className="text-blue-600">SQL</span>
          </Link>
          {status !== "idle" && (
            <Button variant="ghost" size="sm" onClick={reset}>
              초기화
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-8 px-6 py-8">
        <section className="flex min-h-0 flex-1 flex-col">
          <h2 className="mb-4 shrink-0 text-lg font-semibold">입력</h2>
          <InputPanel
            onSubmit={handleSubmit}
            isLoading={isLoading}
            detectedTables={detectedTables}
          />
        </section>

        <section className="flex min-h-0 flex-1 flex-col">
          <h2 className="mb-4 shrink-0 text-lg font-semibold">분석 결과</h2>

          {status === "idle" && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              SQL과 실행 계획을 입력 후 분석하기를 누르세요
            </div>
          )}

          {isLoading && <LoadingSpinner message="AI가 쿼리를 분석 중입니다..." />}

          {status === "error" && error && (
            <ErrorBanner message={error} onDismiss={reset} />
          )}

          {status === "success" && result && (
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ResultPanel result={result} originalSql={lastSql} />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
