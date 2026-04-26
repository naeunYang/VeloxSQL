export const SAMPLE_SQL = `SELECT o.OrderID, c.CustomerName, o.OrderDate,
       SUM(od.Quantity * od.UnitPrice) AS TotalAmount
FROM Orders o
JOIN Customers c ON o.CustomerID = c.CustomerID
JOIN OrderDetails od ON o.OrderID = od.OrderID
WHERE CONVERT(VARCHAR, o.OrderDate, 120) = '2024-01-15'
  AND o.Status = 1
GROUP BY o.OrderID, c.CustomerName, o.OrderDate
ORDER BY TotalAmount DESC`;

export const SAMPLE_PLAN = `<?xml version="1.0" encoding="utf-16"?>
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

export const SAMPLE_SCHEMA = `CREATE TABLE Customers (
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
