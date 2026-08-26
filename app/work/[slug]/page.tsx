import { notFound, permanentRedirect } from "next/navigation";
import { LEGACY_PROJECT_REDIRECTS, type ProjectId } from "@/lib/portfolio/projects";

export function generateStaticParams() {
  return Object.keys(LEGACY_PROJECT_REDIRECTS).map((slug) => ({ slug }));
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = LEGACY_PROJECT_REDIRECTS[slug as ProjectId];
  if (!destination) notFound();
  permanentRedirect(destination);
}
