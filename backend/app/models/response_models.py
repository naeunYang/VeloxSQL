from typing import Literal
from pydantic import BaseModel, Field

# 탐지된 문제
class Bottleneck(BaseModel):
    id: str
    source: Literal["rule", "ai"] # 룰이 잡았는지, AI가 잡았는지
    severity: Literal["high", "medium", "low"] # 심각도
    title: str # 예: 풀 스캔 감지
    description: str # 예: Orders 테이블에서 인덱스 없이 전체 스캔 발생
    plan_node: str | None = None # 실행계획 어느 노드에서 발생했는지


class IndexSuggestion(BaseModel):
    table: str
    columns: list[str]
    index_type: Literal["nonclustered", "covering", "composite"]
    reasoning: str # 왜 이 인덱스가 필요한지
    ddl: str


class AnalyzeResponse(BaseModel):
    query_explanation: str # "이 쿼리는 주문 목록을 조회합니다"
    plan_interpretation: str # "실행계획 해석"
    bottlenecks: list[Bottleneck] = Field(default_factory=list) # 탐지된 문제 목록
    index_suggestions: list[IndexSuggestion] = Field(default_factory=list) # 인덱스 제안 목록
    tuned_sql: str # 튜닝된 쿼리
    detected_tables: list[str] = Field(default_factory=list) # ["Orders", "Customers"]
