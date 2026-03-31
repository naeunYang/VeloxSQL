from typing import Literal
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    sql: str = Field(..., min_length=1, description="분석할 SQL 쿼리")
    execution_plan: str = Field(..., min_length=1, description="MSSQL 실행계획 (XML 또는 텍스트)")
    schema: str | None = Field(default=None, description="CREATE TABLE 문 (선택)")
    db_type: Literal["mssql"] = Field(default="mssql", description="대상 DB 타입")
