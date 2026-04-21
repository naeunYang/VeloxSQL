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

### 3단계 — 백엔드 파이프라인 ✅

#### 3-1 쿼리 파서
- `backend/app/services/query_parser.py` — sqlglot으로 테이블명 추출, 쿼리 타입 식별

#### 3-2 실행계획 파서
- `backend/app/services/plan_analyzer.py` — MSSQL 실행계획 XML/텍스트 파싱

#### 3-3 룰 엔진
- `backend/app/rules/base_rule.py` — AbstractBaseRule
- `backend/app/rules/full_scan_rule.py` — Table Scan / Index Scan 감지
- `backend/app/rules/type_mismatch_rule.py` — CONVERT_IMPLICIT 감지
- `backend/app/rules/missing_index_rule.py` — 누락 인덱스 탐지 + DDL 생성
- `backend/app/rules/nested_loop_rule.py` — 대용량 Nested Loops 감지
- `backend/app/services/rule_engine.py` — 룰 오케스트레이터

#### 3-4 AI 서비스
- `backend/app/prompts/analysis_prompt.py` — 프롬프트 빌더 (룰 결과 포함)
- `backend/app/services/ai_service.py` — Groq API 호출 + 응답 파싱

#### 3-5 오케스트레이터
- `backend/app/services/analysis_service.py` — 파이프라인 오케스트레이터

### 4단계 — 백엔드 라우터 ✅
- `backend/app/routers/analyze.py` — `POST /api/v1/analyze`

### 5단계 — 프론트엔드 타입 + 훅 + lib ✅
- `frontend/src/types/analysis.ts` — 백엔드 Pydantic 모델 대응 TypeScript 타입
- `frontend/src/hooks/useAnalysis.ts` — 분석 요청 상태 관리 훅
- `frontend/src/hooks/useDetectedTables.ts` — 감지된 테이블 목록 관리 훅
- `frontend/src/lib/api.ts` — analyzeQuery() fetch 함수
- `frontend/src/lib/diff.ts` — computeSqlDiff() 줄 단위 diff 유틸
- `docs/dev-setup.md` — 백엔드/프론트엔드 실행 가이드 문서

### 6단계 — 프론트엔드 컴포넌트 ✅
shadcn/ui 기반으로 전체 구현. Button / Textarea / Label / Badge / Card / Tabs / Separator / Alert / ScrollArea 사용.

#### 6-1 공통 컴포넌트
- `src/components/common/CodeBlock.tsx` — ScrollArea 기반 코드 블록
- `src/components/common/DiffView.tsx` — DiffLine[] 렌더링 (+/- 색상)
- `src/components/common/Badge.tsx` — SeverityBadge / SourceBadge (shadcn Badge 래핑)
- `src/components/common/LoadingSpinner.tsx` — 스피너 + 메시지
- `src/components/common/ErrorBanner.tsx` — shadcn Alert 기반

#### 6-2 입력 컴포넌트
- `src/components/input/QueryInput.tsx` — Label + Textarea
- `src/components/input/PlanInput.tsx` — Label + Textarea
- `src/components/input/SchemaInput.tsx` — 접기/펼치기 + 감지된 테이블 안내 (Alert)
- `src/components/input/InputPanel.tsx` — Card 안에 세 입력 + Button

#### 6-3 결과 컴포넌트
- `src/components/results/QueryExplanation.tsx`
- `src/components/results/PlanInterpretation.tsx`
- `src/components/results/BottleneckList.tsx` — Card + SeverityBadge + SourceBadge
- `src/components/results/IndexSuggestions.tsx` — Card + CodeBlock (DDL)
- `src/components/results/TunedQueryView.tsx` — shadcn Tabs (튜닝됨 / 원본 / Diff)
- `src/components/results/ResultPanel.tsx` — shadcn Tabs 컨테이너 (4탭)

#### 6-4 페이지
- `src/app/layout.tsx`
- `src/app/globals.css` — Tailwind v3 호환 HSL CSS 변수
- `src/app/page.tsx` — 랜딩 페이지 (다크→흰 배경, lucide 아이콘 카드)
- `src/app/analyze/page.tsx` — 분석 메인 페이지 (h-screen 고정, 2컬럼 레이아웃)

#### 6-5 설정 변경
- `frontend/tailwind.config.ts` — CSS 변수 색상 매핑 + tailwindcss-animate 플러그인
- `frontend/components.json` — shadcn 설정 파일 (자동 생성)
- `frontend/src/types/css.d.ts` — CSS 모듈 타입 선언
- `frontend/src/lib/utils.ts` — shadcn cn() 유틸 (자동 생성)
- `frontend/src/components/ui/` — shadcn UI 컴포넌트 (자동 생성)

#### UI 개선 (세션)
- 랜딩 페이지: 흰 배경, 피처 카드 3열, lucide-react 아이콘
- 실행 계획 / 스키마 → 선택 항목으로 변경 (canSubmit 조건 완화)
- SchemaInput 접기 제거, 항상 펼침 상태
- analyze 페이지 전체 너비 max-w-7xl 확장
- h-screen 레이아웃으로 페이지 스크롤 제거, textarea flex 비율 분배

---

## 다음 할 일

### 7단계 — 테스트
- `backend/tests/test_query_parser.py`
- `backend/tests/test_plan_analyzer.py`
- `backend/tests/test_rule_engine.py`
- `backend/tests/test_analyze_router.py`
