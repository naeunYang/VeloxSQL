import Link from "next/link";
import { Search, Zap, GitCompare } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "실행 계획 기반 분석",
    desc: "단순 쿼리 리뷰가 아닌 실제 실행 경로를 추적합니다",
  },
  {
    icon: Zap,
    title: "룰 + AI 혼합 탐지",
    desc: "확정적 룰과 AI를 결합해 탐지 정확도를 높입니다",
  },
  {
    icon: GitCompare,
    title: "인덱스 DDL 자동 생성",
    desc: "Original / Diff 비교로 변경 사항을 한눈에 확인합니다",
  },
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          MSSQL 지원
        </div>

        <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Velox<span className="text-blue-600">SQL</span>
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-gray-500 sm:text-xl">
          SQL 쿼리와 실행 계획을 붙여넣으면
          <br />
          느린 원인과 튜닝된 쿼리를 바로 알려드립니다.
        </p>

        <Link
          href="/analyze"
          className="mt-10 inline-block rounded-lg bg-blue-600 px-10 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          지금 분석하기 →
        </Link>
      </div>

      <div className="mt-20 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-muted/40 p-6">
            <Icon className="h-5 w-5 text-blue-600" />
            <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
