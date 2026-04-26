# VeloxSQL 프로젝트 설계

## 개요

SQL 자동 튜닝 AI 웹 서비스. 개발자가 SQL + 실행계획 + 선택적 스키마를 입력하면 느린 원인을 분석하고 튜닝된 쿼리를 제안한다.

- MVP 대상 DB: MSSQL
- 기술 스택: Next.js (TypeScript) + shadcn/ui + FastAPI (Python) + Groq API

---

## 폴더 구조

```
VeloxSQL/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   └── analyze/page.tsx
│   │   ├── components/
│   │   │   ├── analyze/
│   │   │   │   ├── AnalyzeHeader.tsx
│   │   │   │   ├── SqlEditorPanel.tsx   # SQL 입력 + 실행 버튼
│   │   │   │   ├── AuxInputPanel.tsx    # 실행계획/스키마 보조 입력
│   │   │   │   └── AnalysisResultArea.tsx
│   │   │   ├── results/
│   │   │   │   ├── ResultPanel.tsx      # 탭 컨테이너
│   │   │   │   ├── QueryExplanation.tsx
│   │   │   │   ├── PlanInterpretation.tsx
│   │   │   │   ├── BottleneckList.tsx   # rule/ai 출처 구분 표시
│   │   │   │   ├── IndexSuggestions.tsx
│   │   │   │   └── TunedQueryView.tsx   # Original / Diff 토글
│   │   │   └── common/
│   │   │       ├── CodeBlock.tsx
│   │   │       ├── DiffView.tsx         # DiffLine[] 렌더링
│   │   │       ├── Badge.tsx            # severity 배지
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── ErrorBanner.tsx
│   │   ├── hooks/
│   │   │   ├── useAnalysis.ts           # 폼 상태 + API 호출 + 결과 상태 통합
│   │   │   └── useDetectedTables.ts     # SQL에서 테이블명 클라이언트 파싱
│   │   ├── data/
│   │   │   └── sampleData.ts            # 분석 화면 샘플 SQL/실행계획/스키마
│   │   ├── lib/
│   │   │   ├── api.ts                   # 타입 있는 fetch 래퍼 + camelCase 변환
│   │   │   └── diff.ts                  # 원본/튜닝 SQL diff 유틸
│   │   └── types/
│   │       └── analysis.ts              # 공유 TypeScript 인터페이스
│   ├── .env.local
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── backend/
    ├── app/
    │   ├── main.py                      # FastAPI 앱, CORS, 라우터 등록
    │   ├── config.py                    # pydantic-settings로 .env 로드
    │   ├── routers/
    │   │   └── analyze.py               # POST /api/v1/analyze
    │   ├── services/
    │   │   ├── analysis_service.py      # 파이프라인 오케스트레이터
    │   │   ├── query_parser.py          # sqlglot으로 SQL 파싱 + 테이블 감지
    │   │   ├── plan_analyzer.py         # MSSQL 실행계획 XML/텍스트 파싱
    │   │   ├── rule_engine.py           # 룰 등록 + 실행
    │   │   └── ai_service.py            # Groq API 호출
    │   ├── rules/
    │   │   ├── base_rule.py             # AbstractBaseRule
    │   │   ├── full_scan_rule.py
    │   │   ├── type_mismatch_rule.py
    │   │   ├── missing_index_rule.py
    │   │   └── nested_loop_rule.py
    │   ├── models/
    │   │   ├── request_models.py
    │   │   └── response_models.py
    │   └── prompts/
    │       └── analysis_prompt.py       # Groq 프롬프트 빌더
    ├── tests/
    │   ├── test_analyze_router.py
    │   ├── test_rule_engine.py
    │   ├── test_plan_analyzer.py
    │   └── test_query_parser.py
    ├── .env
    └── requirements.txt
```

---

## API 설계

### POST /api/v1/analyze

**Request**
```json
{
  "sql": "string",
  "execution_plan": "string",
  "schema": "string | null",
  "db_type": "mssql"
}
```

**Response**
```json
{
  "query_explanation": "string",
  "plan_interpretation": "string",
  "bottlenecks": [
    {
      "id": "string",
      "source": "rule | ai",
      "severity": "high | medium | low",
      "title": "string",
      "description": "string",
      "plan_node": "string | null"
    }
  ],
  "index_suggestions": [
    {
      "table": "string",
      "columns": ["string"],
      "index_type": "nonclustered | covering | composite",
      "reasoning": "string",
      "ddl": "string"
    }
  ],
  "tuned_sql": "string",
  "detected_tables": ["string"]
}
```

**에러 응답**
- `422` — Pydantic 유효성 실패
- `400` — 실행계획 파싱 불가
- `502` — Groq API 연결 실패
- `500` — 서버 오류

### GET /api/v1/health → `{"status": "ok"}`

---

## 백엔드 분석 파이프라인

`analysis_service.run_analysis()` 순서:

```
입력 (SQL + 실행계획 XML + 스키마?)
        ↓
  query_parser.parse_query()
    → tables (감지된 테이블명 목록), query_type (SELECT/INSERT 등)
        ↓
  plan_analyzer.analyze_plan()
    → operations (RelOp 노드 목록), missing_indexes, warnings, total_cost
    → has_table_scan, has_index_scan (룰 엔진용 플래그)
    ※ XML 파싱 실패 시 is_xml=False로 빈 구조 반환, 파이프라인은 계속 진행
        ↓
  rule_engine.run_rules(plan)
    → bottlenecks (rule 출처 Bottleneck 목록)
    → index_suggestions (CREATE INDEX DDL 포함)
    ※ is_xml=False이면 룰 스킵, 빈 목록 반환
        ↓
  ai_service.analyze()
    → query_explanation, plan_interpretation, tuned_sql
    → AI가 잡은 추가 bottleneck (ai 출처)
    ※ 룰 결과를 프롬프트에 포함 → AI 중복 탐지 금지 지시
        ↓
  결과 병합 → AnalyzeResponse 반환
```

### 룰 목록

| 클래스 | 탐지 내용 | 방법 |
|---|---|---|
| `FullScanRule` | TableScan / IndexScan 연산자 | plan node의 operator_type 확인 |
| `TypeMismatchRule` | 암묵적 타입 변환 경고 | plan warnings의 ConvertIssue 확인 |
| `MissingIndexRule` | 플랜 내 MissingIndex 힌트 | missing_index_hints 직접 읽기 |
| `NestedLoopRule` | 고비용 Nested Loop 조인 | operator_type + estimated_rows 임계값 |

### 룰 vs AI 역할 분리

- **룰**: 실행계획 팩트 탐지. 재현 가능하고 빠름. 스키마 정보 불필요.
- **AI**: 설명 생성 + 룰이 못 잡은 추가 문제 + CREATE INDEX DDL + 튜닝 쿼리 작성.
- AI 프롬프트에 룰 결과를 전달하고 중복 탐지 금지 지시.
- severity는 룰에서 직접 지정. AI 결과는 기본값 "medium".

---

## 주요 TypeScript 타입 (`frontend/src/types/analysis.ts`)

```typescript
export type Severity = "high" | "medium" | "low";
export type BottleneckSource = "rule" | "ai";
export type IndexType = "nonclustered" | "covering" | "composite";

export interface Bottleneck {
  id: string;
  source: BottleneckSource;
  severity: Severity;
  title: string;
  description: string;
  planNode: string | null;
}

export interface IndexSuggestion {
  table: string;
  columns: string[];
  indexType: IndexType;
  reasoning: string;
  ddl: string;
}

export interface AnalysisResult {
  queryExplanation: string;
  planInterpretation: string;
  bottlenecks: Bottleneck[];
  indexSuggestions: IndexSuggestion[];
  tunedSql: string;
  detectedTables: string[];
}
```

`lib/api.ts`에서 snake_case ↔ camelCase 변환 처리.

---

## 환경변수

**backend/.env**
```
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=4096
CORS_ORIGINS=http://localhost:3000
ENV=development
LOG_LEVEL=INFO
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## 주요 의존성

**backend/requirements.txt**
```
fastapi
uvicorn[standard]
pydantic-settings
groq
sqlglot
lxml
pytest
httpx
```

**frontend/package.json**
```
next@15, react@19, typescript@5, tailwindcss@3, shadcn/ui, diff@5
```

> Monaco/CodeMirror 없음 — MVP는 textarea + highlight.js

---

## 구현 순서

1. 폴더 구조 + 설정 파일 (package.json, requirements.txt, tsconfig, next.config, .env 예시)
2. 백엔드 모델 (`request_models.py`, `response_models.py`)
3. 백엔드 파이프라인 (`query_parser` → `plan_analyzer` → 룰 → `ai_service` → `analysis_service`)
4. 백엔드 라우터 + `main.py`
5. 프론트엔드 타입 + 훅 + lib
6. 프론트엔드 컴포넌트 (input → results → common)
7. 테스트 파일 기본 구조
