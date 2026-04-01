from abc import ABC, abstractmethod
from app.models.response_models import Bottleneck
from app.services.plan_analyzer import PlanAnalysis


class BaseRule(ABC):
    """
    모든 룰의 추상 베이스 클래스.

    룰 엔진은 이 클래스를 구현한 룰들을 순서대로 실행하고,
    각 룰이 반환한 Bottleneck 목록을 합쳐서 최종 결과에 포함시킨다.
    """

    @abstractmethod
    def check(self, plan: PlanAnalysis) -> list[Bottleneck]:
        """
        실행계획 분석 결과를 받아 탐지된 문제 목록을 반환한다.
        문제가 없으면 빈 리스트를 반환한다.
        """
        ...
