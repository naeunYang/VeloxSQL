import type { IndexSuggestion } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/common/CodeBlock";

interface IndexSuggestionsProps {
  suggestions: IndexSuggestion[];
}

const INDEX_TYPE_LABELS: Record<IndexSuggestion["index_type"], string> = {
  nonclustered: "비클러스터형",
  covering: "커버링",
  composite: "복합",
};

export function IndexSuggestions({ suggestions }: IndexSuggestionsProps) {
  if (suggestions.length === 0) {
    return <p className="text-sm text-muted-foreground">제안할 인덱스가 없습니다.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {suggestions.map((s, i) => (
        <li key={i}>
          <Card>
            <CardContent className="pt-4 pb-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{INDEX_TYPE_LABELS[s.index_type]}</Badge>
                <span className="text-sm font-medium">
                  <code className="font-mono">{s.table}</code>
                  {" — "}
                  <span className="text-muted-foreground">{s.columns.join(", ")}</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{s.reasoning}</p>
              <CodeBlock code={s.ddl} />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
