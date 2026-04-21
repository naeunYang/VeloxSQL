"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QueryInput } from "./QueryInput";
import { PlanInput } from "./PlanInput";
import { SchemaInput } from "./SchemaInput";
import type { AnalyzeRequest } from "@/types/analysis";

interface InputPanelProps {
  onSubmit: (request: AnalyzeRequest) => void;
  isLoading: boolean;
  detectedTables: string[];
}

export function InputPanel({ onSubmit, isLoading, detectedTables }: InputPanelProps) {
  const [sql, setSql] = useState("");
  const [executionPlan, setExecutionPlan] = useState("");
  const [schema, setSchema] = useState("");

  const canSubmit = sql.trim().length > 0 && !isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      sql: sql.trim(),
      execution_plan: executionPlan.trim() || null,
      schema: schema.trim() || null,
      db_type: "mssql",
    });
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col pt-6">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <QueryInput value={sql} onChange={setSql} disabled={isLoading} />
          <Separator className="shrink-0" />
          <PlanInput value={executionPlan} onChange={setExecutionPlan} disabled={isLoading} />
          <Separator className="shrink-0" />
          <SchemaInput
            value={schema}
            onChange={setSchema}
            detectedTables={detectedTables}
            disabled={isLoading}
          />
          <div className="flex shrink-0 justify-end pt-1">
            <Button type="submit" disabled={!canSubmit}>
              {isLoading ? "분석 중..." : "분석하기"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
