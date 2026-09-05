"use client";

import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { SectionHeading } from "@/components/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import {
  getAllProjects,
  getProjectCategories,
} from "@/data/projects";

export default function ProjectsPage() {
  const projects = getAllProjects();
  const categories = getProjectCategories();
  const { t } = useLanguage();

  return (
    <div className="container-page py-12 sm:py-16">
      <SectionHeading
        title={t.projectsPage.title}
        description={t.projectsPage.description}
      />
      <ProjectsExplorer projects={projects} categories={categories} />
    </div>
  );
}
