from app.models.request_models import AnalyzeRequest
from app.models.response_models import AnalyzeResponse
from app.services.query_parser import parse_query
from app.services.plan_analyzer import analyze_plan, PlanAnalysis
from app.services.rule_engine import run_rules
from app.services import ai_service
from app.services.ai_service import AIServiceError


def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    분석 파이프라인 오케스트레이터.

    흐름:
      1. 쿼리 파싱 → 테이블 목록 추출
      2. 실행계획 파싱 (없으면 빈 구조 사용)
      3. 룰 엔진 실행 → 병목·인덱스 제안
      4. AI 분석 → 설명·해석·튜닝 쿼리·추가 병목
      5. 결과 병합 → AnalyzeResponse 반환

    Raises:
        AIServiceError: Groq API 연결 실패 시 (라우터에서 502로 변환)
    """
    # 1. 쿼리 파싱
    parsed = parse_query(request.sql)
    detected_tables: list[str] = parsed["tables"]

    # 2. 실행계획 파싱
    plan: PlanAnalysis
    if request.execution_plan:
        plan = analyze_plan(request.execution_plan)
    else:
        plan = _empty_plan()

    # 3. 룰 엔진
    rule_bottlenecks, index_suggestions = run_rules(plan)

    # 4. AI 분석 (AIServiceError는 그대로 전파)
    ai_result = ai_service.analyze(
        sql=request.sql,
        plan=plan,
        rule_bottlenecks=rule_bottlenecks,
        schema=request.schema,
    )

    # 5. 병목 병합: 룰 탐지 결과 + AI 추가 탐지 결과
    all_bottlenecks = rule_bottlenecks + ai_result["additional_bottlenecks"]

    return AnalyzeResponse(
        query_explanation=ai_result["query_explanation"],
        plan_interpretation=ai_result["plan_interpretation"],
        bottlenecks=all_bottlenecks,
        index_suggestions=index_suggestions,
        tuned_sql=ai_result["tuned_sql"],
        detected_tables=detected_tables,
    )


def _empty_plan() -> PlanAnalysis:
    """실행계획이 제공되지 않았을 때 사용하는 빈 구조."""
    return PlanAnalysis(
        is_xml=False,
        operations=[],
        missing_indexes=[],
        warnings=[],
        total_cost=0.0,
        has_table_scan=False,
        has_index_scan=False,
    )
