import sqlglot
import sqlglot.expressions as exp


def parse_query(sql: str) -> dict:
    """
    SQL 쿼리를 파싱해서 테이블명과 쿼리 타입을 반환한다.

    Returns:
        {
            "tables": ["Orders", "Customers"],
            "query_type": "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "UNKNOWN"
        }
    """
    tables = _extract_tables(sql)
    query_type = _detect_query_type(sql)

    return {
        "tables": tables,
        "query_type": query_type,
    }


def _extract_tables(sql: str) -> list[str]:
    """sqlglot으로 SQL에서 테이블명 추출."""
    try:
        statements = sqlglot.parse(sql, dialect="tsql") # tsql = MSSQL
        tables: list[str] = []

        for statement in statements:
            if statement is None:
                continue
            for table in statement.find_all(exp.Table):
                name = table.name
                if name and name not in tables:
                    tables.append(name)

        return tables
    except sqlglot.errors.ParseError:
        # 파싱 실패 시 빈 목록 반환 (파이프라인은 계속 진행)
        return []


def _detect_query_type(sql: str) -> str:
    """첫 번째 키워드로 쿼리 타입 식별."""
    first_word = sql.strip().split()[0].upper() if sql.strip() else ""
    if first_word in ("SELECT", "INSERT", "UPDATE", "DELETE"):
        return first_word
    return "UNKNOWN"
