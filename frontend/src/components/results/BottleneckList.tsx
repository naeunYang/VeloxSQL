import type { Bottleneck } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { SeverityBadge, SourceBadge } from "@/components/common/Badge";

interface BottleneckListProps {
  bottlenecks: Bottleneck[];
}

export function BottleneckList({ bottlenecks }: BottleneckListProps) {
  if (bottlenecks.length === 0) {
    return <p className="text-sm text-muted-foreground">감지된 병목 지점이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {bottlenecks.map((b) => (
        <li key={b.id}>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <SeverityBadge severity={b.severity} />
                <SourceBadge source={b.source} />
                <span className="text-sm font-medium">{b.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">{b.description}</p>
              {b.plan_node && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  실행 계획 노드:{" "}
                  <code className="rounded bg-muted px-1 font-mono">{b.plan_node}</code>
                </p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
