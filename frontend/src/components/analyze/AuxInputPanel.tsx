import { Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface AuxInputPanelProps {
  executionPlan: string;
  schema: string;
  detectedTables: string[];
  isLoading: boolean;
  onExecutionPlanChange: (value: string) => void;
  onSchemaChange: (value: string) => void;
}

export function AuxInputPanel({
  executionPlan,
  schema,
  detectedTables,
  isLoading,
  onExecutionPlanChange,
  onSchemaChange,
}: AuxInputPanelProps) {
  return (
    <aside className="min-h-0 w-[360px] shrink-0 overflow-y-auto border-r p-5">
      <Accordion multiple defaultValue={["plan", "schema"]} className="gap-3">
        <AccordionItem value="plan" className="overflow-hidden rounded-lg border border-border px-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span>
              실행 계획{" "}
              <span className="text-xs font-normal text-muted-foreground">(선택)</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="border-t px-4 pb-3 pt-3">
            <p className="mb-2 text-xs text-muted-foreground">
              MSSQL: SET SHOWPLAN_XML ON 또는 실제 실행 계획(XML) 붙여넣기
            </p>
            <Textarea
              value={executionPlan}
              onChange={(e) => onExecutionPlanChange(e.target.value)}
              disabled={isLoading}
              placeholder='<?xml version="1.0"?><ShowPlanXML ...>'
              className="h-64 resize-y font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="schema" className="overflow-hidden rounded-lg border border-border px-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span>
              스키마 정보{" "}
              <span className="text-xs font-normal text-muted-foreground">(선택)</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="border-t px-4 pb-3 pt-3">
            <p className="mb-2 text-xs text-muted-foreground">
              CREATE TABLE 문을 붙여넣으면 더 정확한 분석이 가능합니다
            </p>
            {detectedTables.length > 0 && (
              <Alert className="mb-2 py-2">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <span className="font-medium">감지된 테이블: </span>
                  {detectedTables.map((table) => (
                    <Badge key={table} variant="outline" className="mx-0.5 font-mono text-xs">
                      {table}
                    </Badge>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            <Textarea
              value={schema}
              onChange={(e) => onSchemaChange(e.target.value)}
              disabled={isLoading}
              placeholder={"CREATE TABLE Orders (\n  OrderID INT PRIMARY KEY,\n  ...\n);"}
              className="h-64 resize-y font-mono text-xs"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
