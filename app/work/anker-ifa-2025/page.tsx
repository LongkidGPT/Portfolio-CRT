import type { Metadata } from "next";
import CasePage from "@/components/portfolio/CasePage";
import CaseTemplate from "@/components/portfolio/CaseTemplate";
import { getProjectById } from "@/lib/portfolio/projects";

const project = getProjectById("about");

export const metadata: Metadata = {
  title: `${project.title} — Kid Long`,
  description: project.summary,
};

export default function FeaturedCaseOverviewPage() {
  return <CasePage><CaseTemplate project={project} /></CasePage>;
}
