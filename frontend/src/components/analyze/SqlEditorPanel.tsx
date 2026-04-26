import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnalysisStatus } from "@/types/analysis";

interface SqlEditorPanelProps {
  sql: string;
  isExpanded: boolean;
  isLoading: boolean;
  canSubmit: boolean;
  hasInput: boolean;
  status: AnalysisStatus;
  onSqlChange: (value: string) => void;
  onExpandedChange: (expanded: boolean) => void;
  onLoadSample: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

export function SqlEditorPanel({
  sql,
  isExpanded,
  isLoading,
  canSubmit,
  hasInput,
  status,
  onSqlChange,
  onExpandedChange,
  onLoadSample,
  onReset,
  onSubmit,
}: SqlEditorPanelProps) {
  const summary = sql.trim().replace(/\s+/g, " ") || "SQL이 입력되지 않았습니다.";

  if (!isExpanded) {
    return (
      <div className="shrink-0 border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-sm font-semibold">SQL 쿼리</div>
            <pre className="truncate font-mono text-xs text-muted-foreground">{summary}</pre>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={!hasInput && status === "idle"}
            >
              초기화
            </Button>
            <Button
              size="sm"
              onClick={onSubmit}
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "분석 중..." : "다시 분석"}
            </Button>
            <button
              type="button"
              onClick={() => onExpandedChange(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="SQL 입력창 펼치기"
              title="SQL 입력창 펼치기"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b px-6 pb-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm font-semibold">
          SQL 쿼리 <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-blue-600 hover:underline disabled:opacity-40"
          >
            샘플 데이터 불러오기
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasInput && status === "idle"}
          >
            초기화
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "분석 중..." : "분석하기"}
          </Button>
          {hasInput && (
            <button
              type="button"
              onClick={() => onExpandedChange(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="SQL 입력창 접기"
              title="SQL 입력창 접기"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <Textarea
        value={sql}
        onChange={(e) => onSqlChange(e.target.value)}
        disabled={isLoading}
        placeholder="분석할 SQL 쿼리를 붙여넣으세요..."
        className="min-h-[240px] max-h-[34vh] resize-y font-mono text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSubmit();
        }}
      />
    </div>
  );
}
