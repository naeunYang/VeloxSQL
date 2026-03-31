from typing import Literal
from pydantic import BaseModel, Field


class Bottleneck(BaseModel):
    id: str
    source: Literal["rule", "ai"]
    severity: Literal["high", "medium", "low"]
    title: str
    description: str
    plan_node: str | None = None


class IndexSuggestion(BaseModel):
    table: str
    columns: list[str]
    index_type: Literal["nonclustered", "covering", "composite"]
    reasoning: str
    ddl: str


class AnalyzeResponse(BaseModel):
    query_explanation: str
    plan_interpretation: str
    bottlenecks: list[Bottleneck] = Field(default_factory=list)
    index_suggestions: list[IndexSuggestion] = Field(default_factory=list)
    tuned_sql: str
    detected_tables: list[str] = Field(default_factory=list)
