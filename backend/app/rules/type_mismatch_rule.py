from app.models.response_models import Bottleneck
from app.services.plan_analyzer import PlanAnalysis
from app.rules.base_rule import BaseRule


class TypeMismatchRule(BaseRule):
    """
    암묵적 타입 변환(CONVERT_IMPLICIT) 감지 룰.

    JOIN/WHERE에서 컬럼 타입이 달라 MSSQL이 자동으로 형 변환을 수행할 때 발생.
    변환이 일어난 컬럼의 인덱스를 사용할 수 없게 되어 성능이 크게 저하된다.

    plan_analyzer가 추출한 ConversionWarning 목록을 기반으로 탐지한다.
    """

    def check(self, plan: PlanAnalysis) -> list[Bottleneck]:
        bottlenecks = []

        for i, warning in enumerate(plan["warnings"]):
            expression = warning["expression"]

            bottlenecks.append(Bottleneck(
                id=f"type_mismatch_{i}",
                source="rule",
                severity="high",  # 인덱스 무력화 → 항상 high
                title="암묵적 타입 변환 감지",
                description=(
                    f"타입 불일치로 인해 CONVERT_IMPLICIT가 발생했습니다. "
                    f"인덱스가 무력화될 수 있습니다.\n변환 식: {expression}"
                ),
                plan_node="Warnings > PlanAffectingConvert",
            ))

        return bottlenecks
