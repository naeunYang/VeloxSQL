"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResultPanel } from "@/components/results/ResultPanel";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useDetectedTables } from "@/hooks/useDetectedTables";
import { SAMPLE_SQL, SAMPLE_PLAN, SAMPLE_SCHEMA } from "@/components/input/InputPanel";

export default function AnalyzePage() {
  const { status, result, error, isLoading, analyze, reset } = useAnalysis();
  const { detectedTables, updateTables, clearTables } = useDetectedTables();

  const [lastSql, setLastSql] = useState("");
  const [sql, setSql] = useState("");
  const [executionPlan, setExecutionPlan] = useState("");
  const [schema, setSchema] = useState("");
  const [planOpen, setPlanOpen] = useState(true);
  const [schemaOpen, setSchemaOpen] = useState(true);

  const canSubmit = sql.trim().length > 0 && !isLoading;
  const hasInput =
    sql.trim().length > 0 ||
    executionPlan.trim().length > 0 ||
    schema.trim().length > 0;

  function loadSample() {
    setSql(SAMPLE_SQL);
    setExecutionPlan(SAMPLE_PLAN);
    setSchema(SAMPLE_SCHEMA);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setLastSql(sql.trim());
    await analyze({
      sql: sql.trim(),
      execution_plan: executionPlan.trim() || null,
      schema: schema.trim() || null,
      db_type: "mssql",
    });
  }

  function handleReset() {
    reset();
    setSql("");
    setExecutionPlan("");
    setSchema("");
    setLastSql("");
    clearTables();
  }

  if (result && result.detected_tables.length > 0 && detectedTables.length === 0) {
    updateTables(result.detected_tables);
  }

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">

      {/* ── 헤더 ── */}
      <header className="shrink-0 border-b px-6 py-3">
        <Link href="/" className="text-xl font-bold">
          Velox<span className="text-blue-600">SQL</span>
        </Link>
      </header>

      {/* ── SQL 에디터 (상단 고정) ── */}
      <div className="shrink-0 border-b px-6 pt-4 pb-4">
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-sm font-semibold">
            SQL 쿼리 <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <button
              onClick={loadSample}
              disabled={isLoading}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-blue-600 hover:underline disabled:opacity-40"
            >
              샘플 데이터 불러오기
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={!hasInput && status === "idle"}
            >
              초기화
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "분석 중..." : "분석하기"}
            </Button>
          </div>
        </div>
        <Textarea
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          disabled={isLoading}
          placeholder="분석할 SQL 쿼리를 붙여넣으세요..."
          className="min-h-[300px] resize-y font-mono text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
          }}
        />
      </div>

      {/* ── 하단 2분할 (남은 높이 전체) ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* 왼쪽: 보조 입력 */}
        <div className="flex min-h-0 w-[360px] shrink-0 flex-col gap-3 overflow-hidden border-r p-5">

          {/* 실행 계획 */}
          <div
            className={`overflow-hidden rounded-lg border ${planOpen ? "flex min-h-0 flex-1 flex-col" : ""}`}
          >
            <button
              type="button"
              onClick={() => setPlanOpen(!planOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span>
                실행 계획{" "}
                <span className="text-xs font-normal text-muted-foreground">(선택)</span>
              </span>
              {planOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {planOpen && (
              <div className="flex min-h-0 flex-1 flex-col border-t px-4 py-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  MSSQL: SET SHOWPLAN_XML ON 또는 실제 실행 계획(XML) 붙여넣기
                </p>
                <Textarea
                  value={executionPlan}
                  onChange={(e) => setExecutionPlan(e.target.value)}
                  disabled={isLoading}
                  placeholder='<?xml version="1.0"?><ShowPlanXML ...>'
                  className="min-h-0 flex-1 resize-none font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* 스키마 정보 */}
          <div
            className={`overflow-hidden rounded-lg border ${schemaOpen ? "flex min-h-0 flex-1 flex-col" : ""}`}
          >
            <button
              type="button"
              onClick={() => setSchemaOpen(!schemaOpen)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <span>
                스키마 정보{" "}
                <span className="text-xs font-normal text-muted-foreground">(선택)</span>
              </span>
              {schemaOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {schemaOpen && (
              <div className="flex min-h-0 flex-1 flex-col border-t px-4 py-3">
                <p className="mb-2 text-xs text-muted-foreground">
                  CREATE TABLE 문을 붙여넣으면 더 정밀한 분석이 가능합니다
                </p>
                {detectedTables.length > 0 && (
                  <Alert className="mb-2 py-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <span className="font-medium">감지된 테이블: </span>
                      {detectedTables.map((t) => (
                        <Badge key={t} variant="outline" className="mx-0.5 font-mono text-xs">
                          {t}
                        </Badge>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                <Textarea
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  disabled={isLoading}
                  placeholder={"CREATE TABLE Orders (\n  OrderID INT PRIMARY KEY,\n  ...\n);"}
                  className="min-h-0 flex-1 resize-none font-mono text-xs"
                />
              </div>
            )}
          </div>

        </div>

        {/* 오른쪽: 분석 결과 */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {status === "idle" && (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              SQL을 입력하고 분석하기를 눌러주세요
            </div>
          )}
          {isLoading && <LoadingSpinner message="AI가 쿼리를 분석 중입니다..." />}
          {status === "error" && error && (
            <ErrorBanner message={error} onDismiss={handleReset} />
          )}
          {status === "success" && result && (
            <ResultPanel result={result} originalSql={lastSql} />
          )}
        </div>

      </div>
    </div>
  );
}
