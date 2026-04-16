// 백엔드 request_models.py 에 대응
export type DbType = "mssql";

export interface AnalyzeRequest {
  sql: string;
  execution_plan?: string | null;
  schema?: string | null;
  db_type?: DbType;
}

// 백엔드 response_models.py 에 대응
export type BottleneckSource = "rule" | "ai";
export type BottleneckSeverity = "high" | "medium" | "low";
export type IndexType = "nonclustered" | "covering" | "composite";

export interface Bottleneck {
  id: string;
  source: BottleneckSource;
  severity: BottleneckSeverity;
  title: string;
  description: string;
  plan_node: string | null;
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  index_type: IndexType;
  reasoning: string;
  ddl: string;
}

export interface AnalyzeResponse {
  query_explanation: string;
  plan_interpretation: string;
  bottlenecks: Bottleneck[];
  index_suggestions: IndexSuggestion[];
  tuned_sql: string;
  detected_tables: string[];
}

// UI 상태
export type AnalysisStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalyzeResponse | null;
  error: string | null;
}
