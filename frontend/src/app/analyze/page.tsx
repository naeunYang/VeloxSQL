"use client";

import { useEffect, useState } from "react";
import { AnalysisResultArea } from "@/components/analyze/AnalysisResultArea";
import { AnalyzeHeader } from "@/components/analyze/AnalyzeHeader";
import { AuxInputPanel } from "@/components/analyze/AuxInputPanel";
import { SqlEditorPanel } from "@/components/analyze/SqlEditorPanel";
import { SAMPLE_PLAN, SAMPLE_SCHEMA, SAMPLE_SQL } from "@/data/sampleData";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useDetectedTables } from "@/hooks/useDetectedTables";

export default function AnalyzePage() {
  const { status, result, error, isLoading, analyze, reset } = useAnalysis();
  const { detectedTables, updateTables, clearTables } = useDetectedTables();

  const [lastSql, setLastSql] = useState("");
  const [sql, setSql] = useState("");
  const [executionPlan, setExecutionPlan] = useState("");
  const [schema, setSchema] = useState("");
  const [sqlExpanded, setSqlExpanded] = useState(true);

  const canSubmit = sql.trim().length > 0 && !isLoading;
  const hasInput =
    sql.trim().length > 0 ||
    executionPlan.trim().length > 0 ||
    schema.trim().length > 0;

  useEffect(() => {
    if (result && result.detected_tables.length > 0 && detectedTables.length === 0) {
      updateTables(result.detected_tables);
    }
  }, [detectedTables.length, result, updateTables]);

  useEffect(() => {
    if (status === "success") {
      setSqlExpanded(false);
    }
  }, [status]);

  function loadSample() {
    setSql(SAMPLE_SQL);
    setExecutionPlan(SAMPLE_PLAN);
    setSchema(SAMPLE_SCHEMA);
    setSqlExpanded(true);
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
    setSqlExpanded(true);
    clearTables();
  }

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background">
      <AnalyzeHeader />
      <SqlEditorPanel
        sql={sql}
        isExpanded={sqlExpanded}
        isLoading={isLoading}
        canSubmit={canSubmit}
        hasInput={hasInput}
        status={status}
        onSqlChange={setSql}
        onExpandedChange={setSqlExpanded}
        onLoadSample={loadSample}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <AuxInputPanel
          executionPlan={executionPlan}
          schema={schema}
          detectedTables={detectedTables}
          isLoading={isLoading}
          onExecutionPlanChange={setExecutionPlan}
          onSchemaChange={setSchema}
        />
        <AnalysisResultArea
          status={status}
          result={result}
          error={error}
          isLoading={isLoading}
          originalSql={lastSql}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
