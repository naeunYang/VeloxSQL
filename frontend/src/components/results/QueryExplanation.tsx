interface QueryExplanationProps {
  explanation: string;
}

export function QueryExplanation({ explanation }: QueryExplanationProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">쿼리 설명</h3>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {explanation}
      </p>
    </div>
  );
}
