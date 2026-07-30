import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kid（龙昊翔）· Visual Systems for Product Launch",
  description:
    "资深视觉设计师作品集 — 主视觉策略、品牌视觉系统、产品发布视觉与 AI 创意工作流。",
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
      className={`${inter.variable} ${plexMono.variable}`}
    >
      <body className="bg-bg font-sans text-ink antialiased">
        {children}
        {overlay}
      </body>
    </html>
  );
}
