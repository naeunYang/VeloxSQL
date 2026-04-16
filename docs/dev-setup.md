# 개발 환경 설정 및 실행 가이드

## 백엔드 실행

### 1. `.env` 파일에 Groq API Key 입력

`backend/.env` 파일을 열어 `GROQ_API_KEY` 값을 채운다.

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=4096
CORS_ORIGINS=http://localhost:3000
ENV=development
LOG_LEVEL=INFO
```

> Groq API Key 발급: https://console.groq.com → API Keys

---

### 2. 패키지 설치 (최초 1회)

```bash
cd backend
pip install -r requirements.txt
```

---

### 3. 서버 실행

```bash
cd backend
uvicorn app.main:app --reload
```

| 주소 | 용도 |
|------|------|
| http://localhost:8000/api/v1/health | 헬스체크 |
| http://localhost:8000/docs | Swagger UI (API 테스트) |

---

## 프론트엔드 실행

### 1. 패키지 설치 (최초 1회)

```bash
cd frontend
npm install
```

---

### 2. 개발 서버 실행

```bash
cd frontend
npm run dev
```

접속 주소: http://localhost:3000

---

## 동시 실행

백엔드와 프론트엔드를 각각 별도 터미널에서 실행한다.

```bash
# 터미널 1
cd backend && uvicorn app.main:app --reload

# 터미널 2
cd frontend && npm run dev
```
