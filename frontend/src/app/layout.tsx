import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeloxSQL — SQL 자동 튜닝",
  description: "SQL 쿼리와 실행 계획을 분석하여 병목 원인과 튜닝된 쿼리를 제안합니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
