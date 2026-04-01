from app.models.response_models import Bottleneck
from app.services.plan_analyzer import PlanAnalysis


def build_prompt(
    sql: str,
    plan: PlanAnalysis,
    rule_bottlenecks: list[Bottleneck],
    schema: str | None,
) -> str:
    """
    Groq API에 전달할 분석 프롬프트를 조립한다.

    구성:
      1. 역할 지시 (한국어 응답, JSON 출력)
      2. 입력 데이터 (SQL, 실행계획 요약, 스키마)
      3. 룰 엔진 결과 (이미 탐지된 문제 → AI가 중복 보고 금지)
      4. 출력 형식 명세
    """
    sections = [_system_instruction()]
    sections.append(_sql_section(sql))
    sections.append(_plan_section(plan))

    if schema:
        sections.append(_schema_section(schema))

    if rule_bottlenecks:
        sections.append(_rule_results_section(rule_bottlenecks))

    sections.append(_output_format())

    return "\n\n".join(sections)


# ── 섹션 빌더 ─────────────────────────────────────────────────────────────────

def _system_instruction() -> str:
    return (
        "당신은 MSSQL 전문 쿼리 튜닝 어시스턴트입니다.\n"
        "사용자가 제공한 SQL과 실행계획을 분석해서 반드시 아래 JSON 형식으로만 응답하세요.\n"
        "모든 설명은 반드시 한국어로만 작성하세요. "
        "한국어 이외의 언어(중국어, 일본어, 영어 문장 등)를 절대 섞지 마세요. "
        "단, SQL 키워드·인덱스 연산자(Table Scan, Index Seek, Nested Loops 등) 및 컬럼명·테이블명은 원문 그대로 유지하세요."
    )


def _sql_section(sql: str) -> str:
    return f"## 분석 대상 SQL\n```sql\n{sql.strip()}\n```"


def _plan_section(plan: PlanAnalysis) -> str:
    if not plan["is_xml"]:
        return "## 실행계획\n실행계획 XML 파싱 실패. SQL만으로 분석하세요."

    lines = [f"## 실행계획 요약 (총 비용: {plan['total_cost']:.4f})"]

    # 비용 상위 5개 노드만 포함 (프롬프트 길이 제한)
    top_ops = sorted(plan["operations"], key=lambda o: o["estimated_cost"], reverse=True)[:5]
    if top_ops:
        lines.append("### 주요 연산 노드 (비용 상위 5개)")
        for op in top_ops:
            table_info = f" on {op['table']}" if op["table"] else ""
            index_info = f" ({op['index']})" if op["index"] else ""
            lines.append(
                f"- {op['operation']}{table_info}{index_info} "
                f"| 예상 행: {int(op['estimated_rows']):,} | 비용: {op['estimated_cost']:.4f}"
            )

    if plan["missing_indexes"]:
        lines.append("### 옵티마이저 누락 인덱스 힌트")
        for hint in plan["missing_indexes"]:
            key_cols = hint["equality_columns"] + hint["inequality_columns"]
            lines.append(
                f"- 테이블: {hint['table']} | 키 컬럼: {', '.join(key_cols)} "
                f"| 예상 개선율: {hint['impact']:.1f}%"
            )

    if plan["warnings"]:
        lines.append("### 타입 변환 경고")
        for w in plan["warnings"]:
            lines.append(f"- {w['expression']}")

    return "\n".join(lines)


def _schema_section(schema: str) -> str:
    return f"## 테이블 스키마\n```sql\n{schema.strip()}\n```"


def _rule_results_section(bottlenecks: list[Bottleneck]) -> str:
    """
    룰 엔진이 이미 탐지한 문제 목록을 전달한다.
    AI가 같은 문제를 중복 보고하지 않도록 명시적으로 지시한다.
    """
    lines = [
        "## 룰 엔진 탐지 결과 (이미 탐지된 문제 — 중복 보고 금지)",
        "아래 문제들은 이미 탐지되었으므로 additional_bottlenecks에 포함하지 마세요.",
    ]
    for b in bottlenecks:
        lines.append(f"- [{b.severity.upper()}] {b.title}: {b.description}")
    return "\n".join(lines)


def _output_format() -> str:
    return """\
## 출력 형식 (반드시 이 JSON만 출력, 다른 텍스트 없음)

```json
{
  "query_explanation": "이 쿼리가 무엇을 하는지 1~3문장으로 설명",
  "plan_interpretation": "실행계획의 주요 흐름과 비용 분포 설명",
  "tuned_sql": "튜닝된 SQL 전체. 변경 없으면 원본 그대로",
  "additional_bottlenecks": [
    {
      "title": "문제 제목",
      "severity": "high | medium | low",
      "description": "구체적인 원인과 영향"
    }
  ]
}
```

additional_bottlenecks는 룰 엔진이 잡지 못한 문제만 포함하세요. 없으면 빈 배열 []."""
