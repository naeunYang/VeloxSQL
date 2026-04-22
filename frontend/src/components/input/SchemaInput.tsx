"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface SchemaInputProps {
  value: string;
  onChange: (value: string) => void;
  detectedTables: string[];
  disabled?: boolean;
}

export function SchemaInput({
  value,
  onChange,
  detectedTables,
  disabled = false,
}: SchemaInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="schema-input" className="shrink-0">
        스키마 정보 <span className="text-muted-foreground text-xs font-normal">(선택)</span>
      </Label>
      <p className="shrink-0 text-xs text-muted-foreground">
        CREATE TABLE 문을 붙여넣으면 더 정밀한 분석이 가능합니다
      </p>

      {detectedTables.length > 0 && (
        <Alert className="shrink-0">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">감지된 테이블: </span>
            {detectedTables.map((t) => (
              <Badge key={t} variant="outline" className="mx-0.5 font-mono text-xs">
                {t}
              </Badge>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <Textarea
        id="schema-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={"CREATE TABLE Orders (\n  OrderID INT PRIMARY KEY,\n  CustomerID INT,\n  ...\n);"}
        className="h-32 resize-y font-mono text-sm"
      />
    </div>
  );
}
