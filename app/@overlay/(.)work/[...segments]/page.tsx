import { notFound, permanentRedirect } from "next/navigation";
import CaseOverlay from "@/components/portfolio/CaseOverlay";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import {
  FEATURED_CASE,
  LEGACY_PROJECT_REDIRECTS,
  getProjectByChapterSlug,
  getProjectById,
  type ProjectId,
} from "@/lib/portfolio/projects";

export default async function FeaturedCaseOverlay({
  params,
}: {
  params: Promise<{ segments: string[] }>;
}) {
  const { segments } = await params;

  if (segments.length === 1 && segments[0] !== "anker-ifa-2025") {
    const destination = LEGACY_PROJECT_REDIRECTS[segments[0] as ProjectId];
    if (!destination) notFound();
    permanentRedirect(destination);
  }

  if (segments[0] !== "anker-ifa-2025" || segments.length > 2) notFound();

  const project = segments.length === 1
    ? getProjectById("about")
    : getProjectByChapterSlug(segments[1]);
  if (!project) notFound();

  const isOverview = project.id === "about";
  return (
    <CaseOverlay
      label={project.title}
      fallbackHref={isOverview ? "/" : FEATURED_CASE.overviewHref}
      showCloseControl={false}
    >
      <CaseTemplate project={project} />
    </CaseOverlay>
  );
}
