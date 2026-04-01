# VeloxSQL 개발 진행 현황

## 완료

### 1단계 — 폴더 구조 + 설정 파일 ✅
- `backend/requirements.txt`
- `backend/.env.example`
- `backend/app/main.py` — FastAPI 앱, CORS, `/api/v1/health` 엔드포인트
- `backend/app/config.py` — pydantic-settings로 .env 로드
- `backend/app/` 하위 패키지 디렉토리 전체 (`routers`, `services`, `rules`, `models`, `prompts`, `tests`)
- `frontend/package.json`, `tsconfig.json`, `next.config.ts`
- `frontend/tailwind.config.ts`, `postcss.config.js`
- `frontend/.env.local.example`
- `frontend/src/` 하위 디렉토리 전체 (`app`, `components`, `hooks`, `lib`, `types`)

### 2단계 — 백엔드 Pydantic 모델 ✅
- `backend/app/models/request_models.py` — `AnalyzeRequest`
- `backend/app/models/response_models.py` — `AnalyzeResponse`, `Bottleneck`, `IndexSuggestion`

---

## 다음 할 일

### 3단계 — 백엔드 파이프라인 (진행 중)

#### 3-1 쿼리 파서 ✅
- `backend/app/services/query_parser.py` — sqlglot으로 테이블명 추출, 쿼리 타입 식별

#### 3-2 실행계획 파서 ✅
- `backend/app/services/plan_analyzer.py` — MSSQL 실행계획 XML/텍스트 파싱

#### 3-3 룰 엔진 ✅
- `backend/app/rules/base_rule.py` — AbstractBaseRule
- `backend/app/rules/full_scan_rule.py` — Table Scan / Index Scan 감지
- `backend/app/rules/type_mismatch_rule.py` — CONVERT_IMPLICIT 감지
- `backend/app/rules/missing_index_rule.py` — 누락 인덱스 탐지 + DDL 생성
- `backend/app/rules/nested_loop_rule.py` — 대용량 Nested Loops 감지
- `backend/app/services/rule_engine.py` — 룰 오케스트레이터

#### 3-4 AI 서비스 ✅
- `backend/app/prompts/analysis_prompt.py` — 프롬프트 빌더 (룰 결과 포함)
- `backend/app/services/ai_service.py` — Groq API 호출 + 응답 파싱

#### 3-5 오케스트레이터
- `backend/app/services/analysis_service.py` — 파이프라인 오케스트레이터

### 4단계 — 백엔드 라우터
- `backend/app/routers/analyze.py` — `POST /api/v1/analyze`

### 5단계 — 프론트엔드 타입 + 훅 + lib
- `frontend/src/types/analysis.ts`
- `frontend/src/hooks/useAnalysis.ts`
- `frontend/src/hooks/useDetectedTables.ts`
- `frontend/src/lib/api.ts`
- `frontend/src/lib/diff.ts`

### 6단계 — 프론트엔드 컴포넌트

#### 6-1 공통 컴포넌트
- `src/components/common/CodeBlock.tsx`
- `src/components/common/DiffView.tsx`
- `src/components/common/Badge.tsx`
- `src/components/common/LoadingSpinner.tsx`
- `src/components/common/ErrorBanner.tsx`

#### 6-2 입력 컴포넌트
- `src/components/input/QueryInput.tsx`
- `src/components/input/PlanInput.tsx`
- `src/components/input/SchemaInput.tsx`
- `src/components/input/InputPanel.tsx`

#### 6-3 결과 컴포넌트
- `src/components/results/QueryExplanation.tsx`
- `src/components/results/PlanInterpretation.tsx`
- `src/components/results/BottleneckList.tsx`
- `src/components/results/IndexSuggestions.tsx`
- `src/components/results/TunedQueryView.tsx`
- `src/components/results/ResultPanel.tsx`

#### 6-4 페이지
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/page.tsx`
- `src/app/analyze/page.tsx`

### 7단계 — 테스트
- `backend/tests/test_query_parser.py`
- `backend/tests/test_plan_analyzer.py`
- `backend/tests/test_rule_engine.py`
- `backend/tests/test_analyze_router.py`
