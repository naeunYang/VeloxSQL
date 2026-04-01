import json
import re
from groq import Groq, APIConnectionError, APIStatusError

from app.config import settings
from app.models.response_models import Bottleneck
from app.services.plan_analyzer import PlanAnalysis
from app.prompts.analysis_prompt import build_prompt


# 모듈 로드 시 한 번만 생성
_client = Groq(api_key=settings.groq_api_key)


class AIServiceError(Exception):
    """Groq API 호출 실패 시 발생. 오케스트레이터에서 502로 변환한다."""


def analyze(
    sql: str,
    plan: PlanAnalysis,
    rule_bottlenecks: list[Bottleneck],
    schema: str | None,
) -> dict:
    """
    Groq API를 호출해서 AI 분석 결과를 반환한다.

    Returns:
        {
            "query_explanation": str,
            "plan_interpretation": str,
            "tuned_sql": str,
            "additional_bottlenecks": [{"title", "severity", "description"}]
        }

    Raises:
        AIServiceError: API 연결 실패 또는 응답 파싱 실패
    """
    prompt = build_prompt(sql, plan, rule_bottlenecks, schema)
    raw = _call_groq(prompt)
    return _parse_response(raw, sql)


# ── Groq 호출 ─────────────────────────────────────────────────────────────────

def _call_groq(prompt: str) -> str:
    """Groq API에 메시지를 전송하고 응답 텍스트를 반환한다."""
    try:
        response = _client.chat.completions.create(
            model=settings.groq_model,
            max_tokens=settings.groq_max_tokens,
            temperature=0.2,  # 낮은 temperature → 일관된 분석 결과
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content or ""
    except APIConnectionError as e:
        raise AIServiceError(f"Groq API 연결 실패: {e}") from e
    except APIStatusError as e:
        raise AIServiceError(f"Groq API 오류 ({e.status_code}): {e.message}") from e


# ── 응답 파싱 ─────────────────────────────────────────────────────────────────

def _parse_response(raw: str, original_sql: str) -> dict:
    """
    Groq 응답에서 JSON을 추출한다.

    모델이 ```json ... ``` 코드블록으로 감싸서 반환하는 경우와
    순수 JSON만 반환하는 경우를 모두 처리한다.
    파싱 실패 시 기본값을 채운 구조를 반환해서 파이프라인을 유지한다.
    """
    json_str = _extract_json(raw)
    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        return _fallback_result(original_sql)

    return {
        "query_explanation": data.get("query_explanation", "분석 결과를 가져오지 못했습니다."),
        "plan_interpretation": data.get("plan_interpretation", ""),
        "tuned_sql": data.get("tuned_sql", original_sql),
        "additional_bottlenecks": _parse_bottlenecks(data.get("additional_bottlenecks", [])),
    }


def _extract_json(text: str) -> str:
    """응답 텍스트에서 JSON 부분만 추출한다."""
    # ```json ... ``` 블록 우선 탐색
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
    # 코드블록 없으면 첫 번째 { ... } 추출
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return match.group(0)
    return text


def _parse_bottlenecks(raw_list: list) -> list[Bottleneck]:
    """
    AI가 반환한 additional_bottlenecks 배열을 Bottleneck 객체 목록으로 변환한다.
    필드가 빠지거나 타입이 잘못된 항목은 조용히 건너뛴다.
    """
    bottlenecks = []
    valid_severities = {"high", "medium", "low"}

    for i, item in enumerate(raw_list):
        if not isinstance(item, dict):
            continue
        severity = item.get("severity", "medium")
        if severity not in valid_severities:
            severity = "medium"
        title = item.get("title", "").strip()
        description = item.get("description", "").strip()
        if not title:
            continue
        bottlenecks.append(Bottleneck(
            id=f"ai_{i}",
            source="ai",
            severity=severity,
            title=title,
            description=description,
            plan_node=None,
        ))

    return bottlenecks


def _fallback_result(original_sql: str) -> dict:
    """JSON 파싱 실패 시 파이프라인이 멈추지 않도록 최소 구조를 반환한다."""
    return {
        "query_explanation": "AI 응답 파싱에 실패했습니다. 룰 기반 분석 결과를 참고하세요.",
        "plan_interpretation": "",
        "tuned_sql": original_sql,
        "additional_bottlenecks": [],
    }
