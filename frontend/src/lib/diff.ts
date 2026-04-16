import { diffLines } from "diff";

export type DiffLineType = "added" | "removed" | "unchanged";

export interface DiffLine {
  type: DiffLineType;
  content: string;
}

/**
 * 두 SQL 문자열을 줄 단위로 비교해 DiffLine 배열을 반환한다.
 * 컴포넌트에서 색상 렌더링에 사용.
 */
export function computeSqlDiff(
  originalSql: string,
  tunedSql: string
): DiffLine[] {
  const changes = diffLines(originalSql, tunedSql);

  const lines: DiffLine[] = [];

  for (const change of changes) {
    const type: DiffLineType = change.added
      ? "added"
      : change.removed
        ? "removed"
        : "unchanged";

    // diffLines 는 value 에 여러 줄이 묶여 올 수 있으므로 줄 단위로 분리
    const rawLines = change.value.split("\n");
    // split 결과 마지막에 빈 문자열이 생기는 경우 제거
    if (rawLines.at(-1) === "") rawLines.pop();

    for (const content of rawLines) {
      lines.push({ type, content });
    }
  }

  return lines;
}
