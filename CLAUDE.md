# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 기술 스택

- 프론트: Next.js (TypeScript) — `/frontend`
- 백엔드: FastAPI (Python) — `/backend`
- AI: Groq API

## 개발 명령어

```bash
# 프론트엔드
npm run dev         # localhost:3000
npm run lint
npm run type-check

# 백엔드
uvicorn app.main:app --reload      # localhost:8000  (backend/ 디렉토리에서 실행)
pytest tests/test_foo.py::test_bar # 단일 테스트
```

## 아키텍처

백엔드 분석 흐름: 쿼리 파싱 → 실행계획 분석 → 룰 기반 문제 탐지 → AI 개선 제안

- 룰 기반: 타입 불일치, 풀스캔 등 확정적 탐지
- AI: Groq API로 설명 + 튜닝 제안. 스키마 정보 있으면 컨텍스트 포함
- MVP 대상 DB: MSSQL

## 컨벤션

- 컴포넌트: PascalCase / 함수·변수: camelCase (프론트), snake_case (백엔드)
- `console.log` 금지, `any` 타입 금지, 시크릿은 `.env`

## 개발 방식

- 세션 시작 시 항상 progress.md를 먼저 읽어라
- "작업 완료" 또는 "종료" 라고 하면 progress.md를 업데이트하고, 깃 커밋 + 원격 push까지 해라.
- 기능 하나 완성되면 반드시 멈추고 확인받기
- 승인 후 다음 단계 진행
- 백엔드 → 프론트 순으로 기능별 개발

## 참고

- 기능 상세: `docs/prd.md`
- 프로젝트 설계: `docs/design.md`
- 개발 진행 현황: `docs/progress.md`
