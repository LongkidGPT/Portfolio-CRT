import { notFound } from "next/navigation";
import CaseOverlay from "@/components/portfolio/CaseOverlay";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { PROJECTS } from "@/lib/portfolio/projects";

export default async function WorkOverlay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECTS.find((item) => item.kind === "case" && item.id === slug);
  if (!project) notFound();
  return <CaseOverlay label={project.title}><CaseTemplate project={project} /></CaseOverlay>;
}
