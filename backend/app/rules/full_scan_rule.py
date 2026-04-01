from app.models.response_models import Bottleneck
from app.services.plan_analyzer import PlanAnalysis
from app.rules.base_rule import BaseRule


class FullScanRule(BaseRule):
    """
    Table Scan / Index Scan 감지 룰.

    - Table Scan: 인덱스 자체가 없거나 사용 불가 → 테이블 전체 행을 읽음
    - Index Scan: 인덱스는 있지만 범위 전체를 스캔 → Index Seek보다 비효율적

    예상 행 수가 많을수록 심각도를 높게 판정한다.
    """

    # 예상 행 수 기준으로 심각도 분류
    HIGH_ROWS_THRESHOLD = 10_000
    MEDIUM_ROWS_THRESHOLD = 1_000

    def check(self, plan: PlanAnalysis) -> list[Bottleneck]:
        bottlenecks = []

        for op in plan["operations"]:
            if op["operation"] not in ("Table Scan", "Index Scan"):
                continue

            table = op["table"] or "알 수 없는 테이블"
            rows = op["estimated_rows"]

            if rows >= self.HIGH_ROWS_THRESHOLD:
                severity = "high"
            elif rows >= self.MEDIUM_ROWS_THRESHOLD:
                severity = "medium"
            else:
                severity = "low"

            if op["operation"] == "Table Scan":
                title = "Table Scan 감지"
                description = (
                    f"{table} 테이블에서 인덱스 없이 전체 스캔 발생 "
                    f"(예상 처리 행: {int(rows):,}). "
                    "적절한 인덱스 생성을 권장합니다."
                )
            else:
                title = "Index Scan 감지"
                description = (
                    f"{table} 테이블에서 인덱스 전체 범위 스캔 발생 "
                    f"(예상 처리 행: {int(rows):,}). "
                    "Index Seek로 전환 가능한지 확인하세요."
                )

            bottlenecks.append(Bottleneck(
                id=f"full_scan_{table}",
                source="rule",
                severity=severity,
                title=title,
                description=description,
                plan_node=op["operation"],
            ))

        return bottlenecks
