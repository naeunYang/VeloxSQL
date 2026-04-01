from app.models.response_models import Bottleneck, IndexSuggestion
from app.services.plan_analyzer import PlanAnalysis, MissingIndexHint
from app.rules.base_rule import BaseRule


class MissingIndexRule(BaseRule):
    """
    MSSQL 옵티마이저가 제안한 누락 인덱스 감지 룰.

    실행계획 XML의 <MissingIndexGroup> 힌트를 기반으로 하기 때문에
    옵티마이저가 직접 판단한 정보라 신뢰도가 높다.

    impact 수치를 기준으로 심각도를 분류하고,
    equality/inequality/include 컬럼 정보로 CREATE INDEX DDL까지 생성한다.
    """

    HIGH_IMPACT_THRESHOLD = 70.0
    MEDIUM_IMPACT_THRESHOLD = 30.0

    def check(self, plan: PlanAnalysis) -> list[Bottleneck]:
        bottlenecks = []

        for i, hint in enumerate(plan["missing_indexes"]):
            table = hint["table"]
            impact = hint["impact"]

            if impact >= self.HIGH_IMPACT_THRESHOLD:
                severity = "high"
            elif impact >= self.MEDIUM_IMPACT_THRESHOLD:
                severity = "medium"
            else:
                severity = "low"

            key_cols = hint["equality_columns"] + hint["inequality_columns"]
            include_cols = hint["include_columns"]

            col_summary = ", ".join(key_cols) if key_cols else "알 수 없음"
            bottlenecks.append(Bottleneck(
                id=f"missing_index_{i}",
                source="rule",
                severity=severity,
                title="누락 인덱스 감지",
                description=(
                    f"{table} 테이블에 인덱스가 없어 성능 저하 발생. "
                    f"예상 개선율: {impact:.1f}%. "
                    f"권장 키 컬럼: {col_summary}"
                ),
                plan_node="MissingIndexGroup",
            ))

        return bottlenecks

    def get_index_suggestions(self, plan: PlanAnalysis) -> list[IndexSuggestion]:
        """
        룰 엔진과 별도로 호출 가능한 인덱스 제안 생성 메서드.
        오케스트레이터에서 Bottleneck과 IndexSuggestion을 각각 수집할 때 사용한다.
        """
        suggestions = []

        for hint in plan["missing_indexes"]:
            table = hint["table"]
            key_cols = hint["equality_columns"] + hint["inequality_columns"]
            include_cols = hint["include_columns"]
            impact = hint["impact"]

            if not key_cols:
                continue

            index_type = "covering" if include_cols else "nonclustered"
            ddl = _build_ddl(table, key_cols, include_cols)

            suggestions.append(IndexSuggestion(
                table=table,
                columns=key_cols,
                index_type=index_type,
                reasoning=(
                    f"옵티마이저 추정 성능 개선율 {impact:.1f}%. "
                    f"equality 조건 컬럼({', '.join(hint['equality_columns']) or '없음'})을 앞에, "
                    f"inequality 조건 컬럼({', '.join(hint['inequality_columns']) or '없음'})을 뒤에 배치."
                ),
                ddl=ddl,
            ))

        return suggestions


def _build_ddl(table: str, key_cols: list[str], include_cols: list[str]) -> str:
    """
    누락 인덱스 힌트를 기반으로 CREATE INDEX DDL 문자열을 생성한다.
    테이블명에서 대괄호와 스키마를 제거해 인덱스명으로 활용한다.
    """
    # "[dbo].[Orders]" → "Orders"
    clean_table = table.replace("[", "").replace("]", "").split(".")[-1]
    clean_keys = [c.replace("[", "").replace("]", "") for c in key_cols]
    index_name = f"IX_{clean_table}_{'_'.join(clean_keys)}"

    key_part = ", ".join(key_cols)
    ddl = f"CREATE NONCLUSTERED INDEX {index_name}\nON {table} ({key_part})"

    if include_cols:
        include_part = ", ".join(include_cols)
        ddl += f"\nINCLUDE ({include_part})"

    ddl += ";"
    return ddl
