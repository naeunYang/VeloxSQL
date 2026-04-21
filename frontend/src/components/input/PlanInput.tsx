"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PlanInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PlanInput({ value, onChange, disabled = false }: PlanInputProps) {
  return (
    <div className="flex min-h-0 flex-[2] flex-col gap-1.5">
      <Label htmlFor="plan-input" className="shrink-0">
        실행 계획 <span className="text-muted-foreground text-xs font-normal">(선택)</span>
      </Label>
      <p className="shrink-0 text-xs text-muted-foreground">
        MSSQL: SET SHOWPLAN_XML ON 또는 실제 실행 계획(XML) 붙여넣기
      </p>
      <Textarea
        id="plan-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={'<?xml version="1.0"?><ShowPlanXML ...>'}
        className="min-h-0 flex-1 resize-none font-mono text-sm"
      />
    </div>
  );
}
