"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function QueryInput({ value, onChange, disabled = false }: QueryInputProps) {
  return (
    <div className="flex min-h-0 flex-[2] flex-col gap-1.5">
      <Label htmlFor="query-input" className="shrink-0">
        SQL 쿼리 <span className="text-destructive">*</span>
      </Label>
      <Textarea
        id="query-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="분석할 SQL 쿼리를 붙여넣으세요..."
        className="min-h-0 flex-1 resize-none font-mono text-sm"
      />
    </div>
  );
}
