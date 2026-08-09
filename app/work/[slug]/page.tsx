import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CasePage from "@/components/portfolio/CasePage";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { PROJECTS } from "@/lib/portfolio/projects";

const cases = PROJECTS.filter((project) => project.kind === "case");

export function generateStaticParams() {
  return cases.map((project) => ({ slug: project.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = cases.find((item) => item.id === slug);
  return project ? { title: `${project.title} — Kid Long`, description: project.summary } : {};
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = cases.find((item) => item.id === slug);
  if (!project) notFound();
  return <CasePage><CaseTemplate project={project} /></CasePage>;
}
