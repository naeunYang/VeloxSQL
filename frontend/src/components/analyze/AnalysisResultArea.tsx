import { ErrorBanner } from "@/components/common/ErrorBanner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ResultPanel } from "@/components/results/ResultPanel";
import type { AnalysisStatus, AnalyzeResponse } from "@/types/analysis";

interface AnalysisResultAreaProps {
  status: AnalysisStatus;
  result: AnalyzeResponse | null;
  error: string | null;
  isLoading: boolean;
  originalSql: string;
  onReset: () => void;
}

export function AnalysisResultArea({
  status,
  result,
  error,
  isLoading,
  originalSql,
  onReset,
}: AnalysisResultAreaProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      {status === "idle" && (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
          SQL을 입력하고 분석하기를 눌러주세요
        </div>
      )}
      {isLoading && <LoadingSpinner message="AI가 쿼리를 분석 중입니다..." />}
      {status === "error" && error && <ErrorBanner message={error} onDismiss={onReset} />}
      {status === "success" && result && <ResultPanel result={result} originalSql={originalSql} />}
    </div>
  );
}
