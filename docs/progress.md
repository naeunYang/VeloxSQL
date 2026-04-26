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

#### 6-2 분석 화면 컴포넌트
- `src/components/analyze/AnalyzeHeader.tsx` — 분석 화면 헤더
- `src/components/analyze/SqlEditorPanel.tsx` — SQL 입력, 샘플 로딩, 분석/초기화 액션
- `src/components/analyze/AuxInputPanel.tsx` — 실행계획/스키마 보조 입력
- `src/components/analyze/AnalysisResultArea.tsx` — 상태별 결과 영역

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
- `frontend/src/data/sampleData.ts` — 분석 화면 샘플 SQL/실행계획/스키마
- `frontend/src/components/ui/` — shadcn UI 컴포넌트 (자동 생성)

#### UI 개선 (이전 세션)
- 랜딩 페이지: 흰 배경, 피처 카드 3열, lucide-react 아이콘
- 실행 계획 / 스키마 → 선택 항목으로 변경 (canSubmit 조건 완화)
- SchemaInput 접기 제거, 항상 펼침 상태
- analyze 페이지 전체 너비 max-w-7xl 확장
- h-screen 레이아웃으로 페이지 스크롤 제거, textarea flex 비율 분배
- 각 textarea 크기 조절 가능 (resize-y, 고정 초기 높이)
- 분석하기 버튼: 가운데 정렬, blue-600 브랜드 색상, size="lg"
- 샘플 데이터 불러오기 버튼: "입력" h2 오른쪽에 배치 (레이아웃 영향 없음)
  - MSSQL CONVERT_IMPLICIT + Table Scan + 누락 인덱스 포함 샘플 데이터

#### UI 개선 (현재 세션)
- `CLAUDE.md`: 백엔드 실행 명령어 수정 (`uvicorn app.main:app --reload`)
- `frontend/src/components/ui/tabs.tsx`: shadcn Tailwind v4 문법 → v3 호환 문법으로 수정
  - `data-horizontal:` → `data-[orientation=horizontal]:` 등 전면 교체
  - TabsContent `flex-1` → `w-full` 로 변경
- `analyze/page.tsx`: UI 레이아웃 전면 리팩토링
  - 상단: SQL 에디터 전체 폭 (min-h-[300px], resize 가능, Ctrl+Enter 분석)
  - 하단 2분할: 왼쪽(실행계획+스키마 접기/펼치기), 오른쪽(분석 결과)
  - 양쪽 패널 `overflow-y-auto` 스크롤 정상 동작 (`flex flex-1 overflow-hidden` 구조)
- `InputPanel.tsx`: 버튼 영역 분리 (스크롤 밖에 고정), 초기화 버튼 이동
- 초기화 버튼: 헤더 → 분석하기 옆으로 이동, 입력값+결과 동시 초기화, 항상 표시·비활성화 처리

#### UI 개선 (종료 전 정리)
- `docs/design.md`: 기술 스택에 shadcn/ui 명시, 최신 프론트 폴더 구조 반영
- `frontend/src/components/input/*`: 더 이상 사용하지 않는 입력 컴포넌트 제거
- `frontend/src/data/sampleData.ts`: 샘플 데이터를 컴포넌트에서 분리
- `frontend/src/components/analyze/*`: `/analyze` 페이지 UI를 헤더, SQL 입력, 보조 입력, 결과 영역으로 분리
- `frontend/src/components/ui/accordion.tsx`: shadcn Accordion 추가
- `AuxInputPanel.tsx`: 실행계획/스키마 접기 UI를 shadcn Accordion 기반으로 변경
- `SqlEditorPanel.tsx`: 분석 성공 후 SQL 입력 영역 compact 모드 지원, 접기/펼치기는 아이콘 버튼으로 표시
- `analyze/page.tsx`: 렌더 중 상태 갱신을 `useEffect`로 이동하고 페이지는 상태 조율 중심으로 정리

---

## 다음 할 일

### 7단계 — 테스트
- `backend/tests/test_query_parser.py`
- `backend/tests/test_plan_analyzer.py`
- `backend/tests/test_rule_engine.py`
- `backend/tests/test_analyze_router.py`
