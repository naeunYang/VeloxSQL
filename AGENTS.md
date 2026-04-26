# Repository Guidelines

## Project Structure

See `docs/design.md` for architecture details and `docs/dev-setup.md` for local setup. Main code lives in `backend/app/` and `frontend/src/`; backend tests live in `backend/tests/`.

## Architecture Overview

VeloxSQL uses Next.js, FastAPI, and the Groq API. The backend flow is SQL parsing, execution-plan analysis, rule-based detection, then AI explanations and tuning suggestions. The MVP database target is MSSQL.

## Build, Test, and Development Commands

See `docs/dev-setup.md` for full setup and local run instructions. Common validation commands:

```bash
cd backend
pytest
```

```bash
cd frontend
npm run lint
npm run type-check
```

## Coding Style & Naming Conventions

In `frontend/`, components are `PascalCase`, hooks start with `use`, and functions/variables use `camelCase`.

In `backend/`, modules and functions use `snake_case`, classes use `PascalCase`, and schemas belong in `app/models/`.

Avoid committing secrets, debug `console.log` calls, or broad `any` usage. Keep `.env` files local.

## Agent Workflow Notes

At the start of every session, read `docs/progress.md` first, then check `docs/prd.md` and `docs/design.md` when scope or architecture is unclear. Develop each feature backend-first, then connect the frontend. When one feature is complete, stop and ask for confirmation before starting the next step. After approval, continue with the next task. If the user says "작업 완료" or "종료", update `docs/progress.md`, create a git commit, and push to the remote.

## Testing Guidelines

Backend tests use `pytest`; `httpx` is available for API tests. Name tests `test_*`.

No frontend test runner is currently configured. For frontend changes, run `npm run lint`, `npm run type-check`, and manually verify affected pages in the browser.

## Commit Guidelines

Recent commits use short Conventional Commit-style prefixes. Keep the type in English and write the summary in Korean:

```text
feat: 저장소 작업 가이드 추가
fix: 빈 실행 계획 처리
```

## Security & Configuration Tips

Backend configuration uses environment variables. Create `backend/.env` with `GROQ_API_KEY`, `GROQ_MODEL`, `CORS_ORIGINS`, `ENV`, and `LOG_LEVEL`. Never commit real API keys or production credentials.
