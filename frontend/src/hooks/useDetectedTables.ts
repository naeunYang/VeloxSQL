"use client";

import { useState, useCallback } from "react";

/**
 * 쿼리 분석 결과로 받아온 detected_tables 를 관리한다.
 * 분석 화면에서 "어떤 테이블 스키마가 필요한지" 안내할 때 사용.
 */
export function useDetectedTables() {
  const [detectedTables, setDetectedTables] = useState<string[]>([]);

  const updateTables = useCallback((tables: string[]) => {
    setDetectedTables(tables);
  }, []);

  const clearTables = useCallback(() => {
    setDetectedTables([]);
  }, []);

  return {
    detectedTables,
    hasTables: detectedTables.length > 0,
    updateTables,
    clearTables,
  };
}
