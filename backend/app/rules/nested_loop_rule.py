from app.models.response_models import Bottleneck
from app.services.plan_analyzer import PlanAnalysis
from app.rules.base_rule import BaseRule


class NestedLoopRule(BaseRule):
    """
    대용량 데이터에서의 Nested Loops 조인 감지 룰.

    Nested Loops는 외부 테이블 행마다 내부 테이블을 반복 탐색하는 방식이라,
    소규모 데이터에서는 효율적이지만 행 수가 많아지면 O(N×M)으로 급격히 느려진다.

    예상 행 수가 임계값을 초과하는 Nested Loops 노드만 보고한다.
    (소규모 조인의 Nested Loops는 정상이므로 노이즈 방지 목적)
    """

    # 이 행 수 이상의 Nested Loops는 경고 대상
    ROW_THRESHOLD = 1_000

    def check(self, plan: PlanAnalysis) -> list[Bottleneck]:
        bottlenecks = []

        for i, op in enumerate(plan["operations"]):
            if op["operation"] != "Nested Loops":
                continue
            if op["estimated_rows"] < self.ROW_THRESHOLD:
                continue

            rows = op["estimated_rows"]
            severity = "high" if rows >= 10_000 else "medium"

            bottlenecks.append(Bottleneck(
                id=f"nested_loop_{i}",
                source="rule",
                severity=severity,
                title="대용량 Nested Loops 조인 감지",
                description=(
                    f"예상 {int(rows):,}행에서 Nested Loops 조인 발생. "
                    "Hash Join 또는 Merge Join으로 전환하거나 "
                    "내부 테이블에 인덱스를 추가하는 것을 권장합니다."
                ),
                plan_node="Nested Loops",
            ))

        return bottlenecks
