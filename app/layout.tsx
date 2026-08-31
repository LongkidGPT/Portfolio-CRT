import type { Metadata, Viewport } from "next";
import "./globals.css";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Kid（龙昊翔）· Brand Launch & Visual Campaign",
  description:
    "资深视觉设计师作品集 — 新品发布视觉、品牌活动、视觉系统、产品传播与 AI 创意工作流。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
  overlay,
}: Readonly<{
  children: React.ReactNode;
  overlay: React.ReactNode;
}>) {
  const analyticsCardVisible =
    process.env.NEXT_PUBLIC_ANALYTICS_CARD_VISIBLE === "true";
  const allowAutomatedTracking =
    process.env.NEXT_PUBLIC_ALLOW_AUTOMATED_ANALYTICS === "true";
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-bg font-sans text-ink antialiased">
        <AnalyticsProvider
          cardVisible={analyticsCardVisible}
          allowAutomatedTracking={allowAutomatedTracking}
        >
          {children}
          {overlay}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
