import xml.etree.ElementTree as ET
from typing import TypedDict

# MSSQL 실행계획 XML의 네임스페이스.
# SSMS에서 "실행계획 XML 표시"로 내보낸 파일에는 이 네임스페이스가 붙어 있어서,
# ET로 태그를 찾을 때 반드시 앞에 붙여야 한다. (_NS 변수로 사용)
NS = "http://schemas.microsoft.com/sqlserver/2004/07/showplan"
_NS = f"{{{NS}}}"


# ── 데이터 구조 ──────────────────────────────────────────────────────────────

class PlanNode(TypedDict):
    """
    실행계획의 단일 연산 노드.
    XML의 <RelOp> 태그 하나에 대응한다.

    룰 엔진에서 Table Scan / Index Scan 감지, 비용 기반 병목 판단에 사용.
    """
    operation: str        # 물리 연산 이름. 예: "Table Scan", "Index Seek", "Nested Loops"
    table: str | None     # 연산 대상 테이블명. 조인·서브쿼리 노드는 None일 수 있음
    index: str | None     # 사용된 인덱스명. Table Scan이면 None
    estimated_rows: float # 옵티마이저가 예측한 처리 행 수
    estimated_cost: float # 이 노드 기준 누적 예상 비용 (상대값)


class MissingIndexHint(TypedDict):
    """
    MSSQL 옵티마이저가 실행계획 안에 직접 제안하는 누락 인덱스 정보.
    XML의 <MissingIndexGroup> → <MissingIndex> 구조에서 추출한다.

    룰 엔진의 missing_index_rule과 AI 프롬프트에서 인덱스 DDL 생성에 활용.
    """
    table: str                    # 인덱스가 필요한 테이블
    equality_columns: list[str]   # WHERE col = ? 조건에 쓰인 컬럼 → 인덱스 키 앞쪽에 배치
    inequality_columns: list[str] # WHERE col > ? / BETWEEN 조건 컬럼 → 인덱스 키 뒤쪽에 배치
    include_columns: list[str]    # SELECT에서 참조되는 컬럼 → INCLUDE절로 커버링 인덱스 구성
    impact: float                 # 옵티마이저 예측 성능 개선율 (0~100). 높을수록 긴급


class ConversionWarning(TypedDict):
    """
    암묵적 타입 변환(CONVERT_IMPLICIT) 경고.
    XML의 <PlanAffectingConvert> 태그에서 추출한다.

    타입이 다른 컬럼끼리 JOIN/비교할 때 발생하며, 인덱스를 못 타는 주요 원인이다.
    룰 엔진의 type_mismatch_rule에서 이 목록을 보고 탐지 여부를 결정한다.
    """
    expression: str  # 예: "CONVERT_IMPLICIT(int, [dbo].[Orders].[CustomerId], 0)"


class PlanAnalysis(TypedDict):
    """
    analyze_plan()이 반환하는 최종 분석 결과.
    파이프라인 전체에서 이 구조체 하나를 주고받는다.

    - 룰 엔진: operations / missing_indexes / warnings / has_* 플래그 사용
    - AI 서비스: total_cost + missing_indexes를 프롬프트 컨텍스트로 포함
    """
    is_xml: bool                        # XML 파싱 성공 여부. False면 나머지 필드는 모두 비어 있음
    operations: list[PlanNode]          # 실행계획 내 전체 연산 노드 목록
    missing_indexes: list[MissingIndexHint]  # 옵티마이저 누락 인덱스 제안 목록
    warnings: list[ConversionWarning]   # 암묵적 타입 변환 경고 목록
    total_cost: float                   # 쿼리 전체 예상 비용 (StatementSubTreeCost)
    has_table_scan: bool                # Table Scan 노드가 하나라도 있으면 True
    has_index_scan: bool                # Index Scan(범위 스캔) 노드가 있으면 True


# ── 공개 API ─────────────────────────────────────────────────────────────────

def analyze_plan(execution_plan: str) -> PlanAnalysis:
    """
    MSSQL 실행계획을 분석해서 구조화된 결과를 반환.

    XML 파싱 실패 또는 텍스트 형식인 경우 is_xml=False로 빈 구조 반환.
    파이프라인은 is_xml=False여도 계속 진행된다.
    """
    if execution_plan.strip().startswith("<"):
        return _parse_xml_plan(execution_plan.strip())
    return _empty_result(is_xml=False)


# ── 내부 파싱 함수 ────────────────────────────────────────────────────────────

def _parse_xml_plan(xml_text: str) -> PlanAnalysis:
    """XML 파싱 후 각 추출 함수를 호출해 PlanAnalysis를 조립한다."""
    try:
        root = ET.fromstring(xml_text)
    except ET.ParseError:
        return _empty_result(is_xml=False)

    operations = _extract_operations(root)
    missing_indexes = _extract_missing_indexes(root)
    warnings = _extract_warnings(root)
    total_cost = _extract_total_cost(root)

    return PlanAnalysis(
        is_xml=True,
        operations=operations,
        missing_indexes=missing_indexes,
        warnings=warnings,
        total_cost=total_cost,
        has_table_scan=any(op["operation"] == "Table Scan" for op in operations),
        has_index_scan=any(op["operation"] == "Index Scan" for op in operations),
    )


def _extract_operations(root: ET.Element) -> list[PlanNode]:
    """
    XML 전체를 순회하며 <RelOp> 태그를 모두 수집한다.
    RelOp = Relational Operator. 실행계획 트리의 각 노드에 해당한다.
    """
    operations = []
    for rel_op in root.iter(f"{_NS}RelOp"): # 실행계획 모든 노드 긁어옴
        physical_op = rel_op.get("PhysicalOp", "") # 물리연산  예: "Table Scan", "Index Seek", "Nested Loops"
        estimated_rows = float(rel_op.get("EstimateRows", 0))
        estimated_cost = float(rel_op.get("EstimatedTotalSubtreeCost", 0))
        table, index = _extract_object_info(rel_op)
        operations.append(PlanNode(
            operation=physical_op,
            table=table,
            index=index,
            estimated_rows=estimated_rows,
            estimated_cost=estimated_cost,
        ))
    return operations


def _extract_object_info(rel_op: ET.Element) -> tuple[str | None, str | None]:
    """
    RelOp 직속 자식 태그(TableScan, IndexScan, IndexSeek 등) 안의
    <Object> 태그에서 테이블명과 인덱스명을 꺼낸다.

    구조 예시:
      <RelOp PhysicalOp="Index Seek">
        <IndexScan>
          <Object Table="[Orders]" Index="[IX_Orders_CustomerId]" ... />
        </IndexScan>
      </RelOp>
    """
    for child in rel_op:
        obj = child.find(f"{_NS}Object")
        if obj is not None:
            return obj.get("Table"), obj.get("Index")
    return None, None


def _extract_missing_indexes(root: ET.Element) -> list[MissingIndexHint]:
    """
    <MissingIndexGroup> 태그를 찾아 인덱스 제안 목록을 반환한다.

    XML 구조:
      <MissingIndexGroup Impact="82.3">
        <MissingIndex Table="[dbo].[Orders]">
          <ColumnGroup Usage="EQUALITY">
            <Column Name="CustomerId" />
          </ColumnGroup>
          <ColumnGroup Usage="INCLUDE">
            <Column Name="OrderDate" />
          </ColumnGroup>
        </MissingIndex>
      </MissingIndexGroup>

    Usage 종류:
      EQUALITY   → WHERE col = ?  (인덱스 키 앞쪽)
      INEQUALITY → WHERE col > ?  (인덱스 키 뒤쪽)
      INCLUDE    → SELECT col     (INCLUDE절, 커버링 인덱스)
    """
    hints = []
    for group in root.iter(f"{_NS}MissingIndexGroup"):
        impact = float(group.get("Impact", 0))
        for missing_index in group.iter(f"{_NS}MissingIndex"):
            table = missing_index.get("Table", "")
            equality_cols: list[str] = []
            inequality_cols: list[str] = []
            include_cols: list[str] = []

            for col_group in missing_index.findall(f"{_NS}ColumnGroup"):
                usage = col_group.get("Usage", "")
                cols = [col.get("Name", "") for col in col_group.findall(f"{_NS}Column")]
                if usage == "EQUALITY":
                    equality_cols.extend(cols)
                elif usage == "INEQUALITY":
                    inequality_cols.extend(cols)
                elif usage == "INCLUDE":
                    include_cols.extend(cols)

            hints.append(MissingIndexHint(
                table=table,
                equality_columns=equality_cols,
                inequality_columns=inequality_cols,
                include_columns=include_cols,
                impact=impact,
            ))
    return hints


def _extract_warnings(root: ET.Element) -> list[ConversionWarning]:
    """
    <PlanAffectingConvert> 태그를 찾아 암묵적 타입 변환 경고를 반환한다.

    발생 원인: JOIN/WHERE에서 컬럼 타입이 달라 MSSQL이 한쪽을 자동 변환할 때.
    부작용: 변환 대상 컬럼의 인덱스를 사용할 수 없게 되어 성능 저하 유발.

    XML 구조:
      <Warnings>
        <PlanAffectingConvert
          Expression="CONVERT_IMPLICIT(int, [dbo].[Orders].[CustomerId], 0)"
          ConvertIssue="Seek Plan" />
      </Warnings>
    """
    warnings = []
    for warning in root.iter(f"{_NS}PlanAffectingConvert"):
        expression = warning.get("Expression", "")
        if expression:
            warnings.append(ConversionWarning(expression=expression))
    return warnings


def _extract_total_cost(root: ET.Element) -> float:
    """
    <StmtSimple> 태그의 StatementSubTreeCost 속성에서 쿼리 전체 비용을 꺼낸다.
    여러 statement가 있으면 첫 번째 값만 사용한다.
    이 값은 절대 수치가 아닌 상대적 비용이므로 다른 쿼리와 비교용으로 쓴다.
    """
    for stmt in root.iter(f"{_NS}StmtSimple"):
        cost = stmt.get("StatementSubTreeCost")
        if cost:
            return float(cost)
    return 0.0


def _empty_result(is_xml: bool) -> PlanAnalysis:
    """파싱 불가 시 반환하는 빈 구조. 파이프라인이 중단되지 않도록 동일한 타입을 유지한다."""
    return PlanAnalysis(
        is_xml=is_xml,
        operations=[],
        missing_indexes=[],
        warnings=[],
        total_cost=0.0,
        has_table_scan=False,
        has_index_scan=False,
    )
