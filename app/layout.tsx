import type { Metadata, Viewport } from "next";
import "./globals.css";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Kid（龙昊翔）· Senior Visual Designer · Consumer Technology",
  description:
    "资深视觉设计师作品集 — 消费科技品牌视觉系统、全球新品 Campaign、包装系统与多触点传播。",
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
