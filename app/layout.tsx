import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kid（龙昊翔）· Visual Systems for Product Launch",
  description:
    "资深视觉设计师作品集 — 主视觉策略、品牌视觉系统、产品发布视觉与 AI 创意工作流。",
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
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
    >
      <body className="bg-bg font-sans text-ink antialiased">
        {children}
        {overlay}
      </body>
    </html>
  );
}
