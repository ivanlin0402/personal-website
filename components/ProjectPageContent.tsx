"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { ProjectDetail } from "@/components/ProjectDetail";
import { useLanguage } from "@/components/LanguageProvider";

type ProjectPageContentProps = {
  project: Project;
};

export function ProjectPageContent({ project }: ProjectPageContentProps) {
  const { t } = useLanguage();
  const isCatalog = Boolean(project.games && project.games.length > 0);
  const containerClass = isCatalog ? "container-page" : "container-narrow";

  return (
    <div className={`${containerClass} py-12 sm:py-16`}>
      <Link
        href="/projects"
        className="mb-8 inline-flex text-[13px] text-dim transition-colors duration-200 hover:text-muted"
      >
        {t.project.back}
      </Link>

      <ProjectDetail project={project} />
    </div>
  );
}
