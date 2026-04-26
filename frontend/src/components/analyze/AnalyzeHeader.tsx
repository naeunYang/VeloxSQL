import Link from "next/link";

export function AnalyzeHeader() {
  return (
    <header className="shrink-0 border-b px-6 py-3">
      <Link href="/" className="text-xl font-bold">
        Velox<span className="text-blue-600">SQL</span>
      </Link>
    </header>
  );
}
