import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CasePage from "@/components/portfolio/CasePage";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import {
  FEATURED_CASE_NAVIGATION,
  getProjectByChapterSlug,
} from "@/lib/portfolio/projects";

export function generateStaticParams() {
  return FEATURED_CASE_NAVIGATION
    .filter(({ id }) => id !== "about")
    .map(({ id }) => ({ chapter: id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter: string }>;
}): Promise<Metadata> {
  const { chapter } = await params;
  const project = getProjectByChapterSlug(chapter);
  return project
    ? { title: `${project.title} — Kid Long`, description: project.summary }
    : {};
}

export default async function FeaturedCaseChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const project = getProjectByChapterSlug(chapter);
  if (!project) notFound();
  return <CasePage><CaseTemplate project={project} /></CasePage>;
}
