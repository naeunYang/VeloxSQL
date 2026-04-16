import type { AnalyzeRequest, AnalyzeResponse } from "@/types/analysis";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<T>(
  path: string,
  options: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? message;
    } catch {
      // 파싱 실패 시 기본 메시지 사용
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

export async function analyzeQuery(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  return fetchJson<AnalyzeResponse>("/api/v1/analyze", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
