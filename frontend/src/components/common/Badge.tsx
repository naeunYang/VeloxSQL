import { Badge } from "@/components/ui/badge";
import type { BottleneckSeverity, BottleneckSource } from "@/types/analysis";

interface SeverityBadgeProps {
  severity: BottleneckSeverity;
}

const SEVERITY_VARIANT: Record<BottleneckSeverity, "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
};

const SEVERITY_LABELS: Record<BottleneckSeverity, string> = {
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <Badge variant={SEVERITY_VARIANT[severity]}>{SEVERITY_LABELS[severity]}</Badge>
  );
}

interface SourceBadgeProps {
  source: BottleneckSource;
}

const SOURCE_LABELS: Record<BottleneckSource, string> = {
  rule: "룰 탐지",
  ai: "AI 탐지",
};

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <Badge variant="outline" className={source === "rule" ? "border-purple-300 text-purple-700" : "border-emerald-300 text-emerald-700"}>
      {SOURCE_LABELS[source]}
    </Badge>
  );
}
