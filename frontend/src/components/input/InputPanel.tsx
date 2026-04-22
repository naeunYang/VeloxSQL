"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QueryInput } from "./QueryInput";
import { PlanInput } from "./PlanInput";
import { SchemaInput } from "./SchemaInput";
import type { AnalyzeRequest } from "@/types/analysis";

const SAMPLE_SQL = `SELECT o.OrderID, c.CustomerName, o.OrderDate,
       SUM(od.Quantity * od.UnitPrice) AS TotalAmount
FROM Orders o
JOIN Customers c ON o.CustomerID = c.CustomerID
JOIN OrderDetails od ON o.OrderID = od.OrderID
WHERE CONVERT(VARCHAR, o.OrderDate, 120) = '2024-01-15'
  AND o.Status = 1
GROUP BY o.OrderID, c.CustomerName, o.OrderDate
ORDER BY TotalAmount DESC`;

const SAMPLE_PLAN = `<?xml version="1.0" encoding="utf-16"?>
<ShowPlanXML xmlns="http://schemas.microsoft.com/sqlserver/2004/07/showplan" Version="1.6" Build="15.0.4153.1">
  <BatchSequence>
    <Batch>
      <Statements>
        <StmtSimple StatementType="SELECT">
          <QueryPlan>
            <MissingIndexes>
              <MissingIndexGroup Impact="85.3">
                <MissingIndex Database="[ShopDB]" Schema="[dbo]" Table="[Orders]">
                  <ColumnGroup Usage="EQUALITY">
                    <Column Name="Status" />
                  </ColumnGroup>
                  <ColumnGroup Usage="INCLUDE">
                    <Column Name="OrderDate" />
                    <Column Name="CustomerID" />
                  </ColumnGroup>
                </MissingIndex>
              </MissingIndexGroup>
            </MissingIndexes>
            <RelOp PhysicalOp="Sort" LogicalOp="Sort" EstimateRows="1000" EstimateCPU="0.112" EstimateIO="0.0">
              <RelOp PhysicalOp="Hash Match" LogicalOp="Aggregate" EstimateRows="1000">
                <RelOp PhysicalOp="Hash Match" LogicalOp="Inner Join" EstimateRows="5000">
                  <RelOp PhysicalOp="Table Scan" LogicalOp="Table Scan" EstimateRows="50000" EstimateIO="0.558">
                    <Object Table="[Orders]" Index="[PK_Orders]" />
                    <ConvertWarning ConvertIssue="Implicit conversion" Expression="[Orders].[OrderDate]" />
                  </RelOp>
                  <RelOp PhysicalOp="Index Scan" LogicalOp="Index Scan" EstimateRows="10000">
                    <Object Table="[OrderDetails]" Index="[IX_OrderDetails_OrderID]" />
                  </RelOp>
                </RelOp>
              </RelOp>
            </RelOp>
          </QueryPlan>
        </StmtSimple>
      </Statements>
    </Batch>
  </BatchSequence>
</ShowPlanXML>`;

const SAMPLE_SCHEMA = `CREATE TABLE Customers (
  CustomerID   INT           PRIMARY KEY,
  CustomerName NVARCHAR(100) NOT NULL,
  Email        NVARCHAR(200),
  CreatedAt    DATETIME      DEFAULT GETDATE()
);

CREATE TABLE Orders (
  OrderID    INT      PRIMARY KEY,
  CustomerID INT      NOT NULL,
  OrderDate  DATETIME NOT NULL,
  Status     TINYINT  NOT NULL DEFAULT 0,
  FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

CREATE INDEX IX_Orders_Status ON Orders(Status) INCLUDE (OrderDate, CustomerID);

CREATE TABLE OrderDetails (
  DetailID  INT           PRIMARY KEY,
  OrderID   INT           NOT NULL,
  ProductID INT           NOT NULL,
  Quantity  INT           NOT NULL,
  UnitPrice DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (OrderID) REFERENCES Orders(OrderID)
);`;

export { SAMPLE_SQL, SAMPLE_PLAN, SAMPLE_SCHEMA };

interface InputPanelProps {
  onSubmit: (request: AnalyzeRequest) => void;
  isLoading: boolean;
  detectedTables: string[];
  sql: string;
  onSqlChange: (v: string) => void;
  executionPlan: string;
  onExecutionPlanChange: (v: string) => void;
  schema: string;
  onSchemaChange: (v: string) => void;
}

export function InputPanel({
  onSubmit,
  isLoading,
  detectedTables,
  sql,
  onSqlChange,
  executionPlan,
  onExecutionPlanChange,
  schema,
  onSchemaChange,
}: InputPanelProps) {
  const canSubmit = sql.trim().length > 0 && !isLoading;

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      sql: sql.trim(),
      execution_plan: executionPlan.trim() || null,
      schema: schema.trim() || null,
      db_type: "mssql",
    });
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardContent className="flex min-h-0 flex-1 flex-col pt-6">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
          <QueryInput value={sql} onChange={onSqlChange} disabled={isLoading} />
          <Separator className="shrink-0" />
          <PlanInput value={executionPlan} onChange={onExecutionPlanChange} disabled={isLoading} />
          <Separator className="shrink-0" />
          <SchemaInput
            value={schema}
            onChange={onSchemaChange}
            detectedTables={detectedTables}
            disabled={isLoading}
          />
          <div className="flex shrink-0 justify-center pt-1">
            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "분석 중..." : "분석하기"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
