import type { Metadata } from "next";

import KvSyncTest from "@/components/portfolio/KvSyncTest";

export const metadata: Metadata = {
  title: "KV Sync Test",
};

export default function KvSyncTestPage() {
  return <KvSyncTest />;
}
