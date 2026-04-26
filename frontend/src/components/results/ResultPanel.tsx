"use client";

import type { AnalyzeResponse } from "@/types/analysis";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QueryExplanation } from "./QueryExplanation";
import { PlanInterpretation } from "./PlanInterpretation";
import { BottleneckList } from "./BottleneckList";
import { IndexSuggestions } from "./IndexSuggestions";
import { TunedQueryView } from "./TunedQueryView";

interface ResultPanelProps {
  result: AnalyzeResponse;
  originalSql: string;
}

export function ResultPanel({ result, originalSql }: ResultPanelProps) {
  return (
    <Card className="border border-border">
      <CardContent className="pt-6">
        <Tabs defaultValue="explanation">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="explanation">쿼리 설명</TabsTrigger>
            <TabsTrigger value="bottlenecks" className="gap-1.5">
              병목 지점
              {result.bottlenecks.length > 0 && (
                <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                  {result.bottlenecks.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="indexes" className="gap-1.5">
              인덱스 제안
              {result.index_suggestions.length > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  {result.index_suggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tuned">튜닝된 쿼리</TabsTrigger>
          </TabsList>

          <TabsContent value="explanation" className="flex flex-col gap-4">
            <QueryExplanation explanation={result.query_explanation} />
            <Separator />
            <PlanInterpretation interpretation={result.plan_interpretation} />
          </TabsContent>

          <TabsContent value="bottlenecks">
            <BottleneckList bottlenecks={result.bottlenecks} />
          </TabsContent>

          <TabsContent value="indexes">
            <IndexSuggestions suggestions={result.index_suggestions} />
          </TabsContent>

          <TabsContent value="tuned">
            <TunedQueryView
              originalSql={originalSql}
              tunedSql={result.tuned_sql}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
