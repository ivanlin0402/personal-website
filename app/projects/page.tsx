import type { Metadata } from "next";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getAllProjects,
  getProjectCategories,
} from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "All projects, activities, and experiments.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const categories = getProjectCategories();

  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeading
        title="Projects"
        description="Everything collected in one place. Filter by category or open a project for more detail."
      />
      <ProjectsExplorer projects={projects} categories={categories} />
    </div>
  );
}
