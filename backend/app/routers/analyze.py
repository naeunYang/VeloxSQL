from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.request_models import AnalyzeRequest
from app.models.response_models import AnalyzeResponse
from app.services import analysis_service
from app.services.ai_service import AIServiceError

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    SQL 쿼리 + 실행계획(선택) + 스키마(선택)를 받아 분석 결과를 반환한다.

    에러 코드:
      422 — Pydantic 유효성 실패 (FastAPI 자동 처리)
      502 — Groq API 연결 실패
      500 — 예상치 못한 서버 오류
    """
    try:
        return analysis_service.analyze(request)
    except AIServiceError as e:
        return JSONResponse(status_code=502, content={"detail": str(e)})
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"서버 오류: {e}"})