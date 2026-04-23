interface PlanInterpretationProps {
  interpretation: string;
}

export function PlanInterpretation({ interpretation }: PlanInterpretationProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-foreground">실행 계획 해석</h3>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {interpretation}
      </p>
    </div>
  );
}
