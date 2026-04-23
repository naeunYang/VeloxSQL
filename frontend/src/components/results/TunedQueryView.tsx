"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/common/CodeBlock";
import { DiffView } from "@/components/common/DiffView";
import { computeSqlDiff } from "@/lib/diff";

interface TunedQueryViewProps {
  originalSql: string;
  tunedSql: string;
}

export function TunedQueryView({ originalSql, tunedSql }: TunedQueryViewProps) {
  const diffLines = computeSqlDiff(originalSql, tunedSql);

  return (
    <Tabs defaultValue="tuned">
      <TabsList className="mb-3">
        <TabsTrigger value="tuned">튜닝됨</TabsTrigger>
        <TabsTrigger value="original">원본</TabsTrigger>
        <TabsTrigger value="diff">Diff</TabsTrigger>
      </TabsList>
      <TabsContent value="tuned">
        <CodeBlock code={tunedSql} />
      </TabsContent>
      <TabsContent value="original">
        <CodeBlock code={originalSql} />
      </TabsContent>
      <TabsContent value="diff">
        <DiffView lines={diffLines} />
      </TabsContent>
    </Tabs>
  );
}
