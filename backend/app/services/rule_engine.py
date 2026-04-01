from app.models.response_models import Bottleneck, IndexSuggestion
from app.services.plan_analyzer import PlanAnalysis
from app.rules.full_scan_rule import FullScanRule
from app.rules.type_mismatch_rule import TypeMismatchRule
from app.rules.missing_index_rule import MissingIndexRule
from app.rules.nested_loop_rule import NestedLoopRule


# 실행할 룰 목록. 순서는 심각도 탐지 우선순위 기준.
_RULES = [
    TypeMismatchRule(),   # 인덱스 무력화 → 가장 먼저 탐지
    FullScanRule(),       # 스캔 여부
    MissingIndexRule(),   # 옵티마이저 누락 인덱스 힌트
    NestedLoopRule(),     # 대용량 조인
]

_MISSING_INDEX_RULE = MissingIndexRule()


def run_rules(plan: PlanAnalysis) -> tuple[list[Bottleneck], list[IndexSuggestion]]:
    """
    모든 룰을 실행하고 (병목 목록, 인덱스 제안 목록)을 반환한다.

    plan_analyzer의 is_xml=False인 경우 룰을 건너뛰고 빈 결과를 반환한다.
    (실행계획 파싱 실패 시 룰 기반 분석 없이 AI 분석만 수행)
    """
    if not plan["is_xml"]:
        return [], []

    bottlenecks: list[Bottleneck] = []
    for rule in _RULES:
        bottlenecks.extend(rule.check(plan))

    # 인덱스 제안은 MissingIndexRule에서 별도 생성
    index_suggestions = _MISSING_INDEX_RULE.get_index_suggestions(plan)

    return bottlenecks, index_suggestions
