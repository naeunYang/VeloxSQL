from typing import Literal
from pydantic import BaseModel, Field

# Field : 규칙 정의
# ... : 필수값
# min_length : 최소 길이
# description : Swagger용 설명
class AnalyzeRequest(BaseModel):
    sql: str = Field(..., min_length=1, description="분석할 SQL 쿼리")
    execution_plan: str | None = Field(default=None, description="MSSQL 실행계획 (XML 또는 텍스트, 선택 — 있으면 더 정밀한 분석 제공)")
    schema: str | None = Field(default=None, description="CREATE TABLE 문 (선택)")
    db_type: Literal["mssql"] = Field(default="mssql", description="대상 DB 타입")
