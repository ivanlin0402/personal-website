"use client";

import type { Project } from "@/lib/types";
import { GameCatalogGrid } from "@/components/GameCatalogGrid";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectLinks } from "@/components/ProjectLinks";
import {
  ProjectList,
  ProjectParagraph,
  ProjectSection,
} from "@/components/ProjectSection";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { useLanguage } from "@/components/LanguageProvider";

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { t } = useLanguage();
  const hasLinks =
    Boolean(project.githubUrl) ||
    Boolean(project.demoUrl) ||
    Boolean(project.documentationUrl);

  return (
    <article>
      <ProjectHeader project={project} />

      <div className="mt-2">
        {project.overview ? (
          <ProjectSection title={t.project.overview}>
            <ProjectParagraph>{project.overview}</ProjectParagraph>
          </ProjectSection>
        ) : null}

        {project.updates && project.updates.length > 0 ? (
          <ProjectSection title={t.project.timeline}>
            <ProjectTimeline updates={project.updates} />
          </ProjectSection>
        ) : null}

        {project.games && project.games.length > 0 ? (
          <GameCatalogGrid games={project.games} />
        ) : null}

        {project.goals && project.goals.length > 0 ? (
          <ProjectSection title={t.project.goals}>
            <ProjectList items={project.goals} />
          </ProjectSection>
        ) : null}

        {project.process && project.process.length > 0 ? (
          <ProjectSection title={t.project.process}>
            <ProjectList items={project.process} />
          </ProjectSection>
        ) : null}

        {project.technicalDetails && project.technicalDetails.length > 0 ? (
          <ProjectSection title={t.project.technicalDetails}>
            <ProjectList items={project.technicalDetails} />
          </ProjectSection>
        ) : null}

        {project.results && project.results.length > 0 ? (
          <ProjectSection title={t.project.results}>
            <ProjectList items={project.results} />
          </ProjectSection>
        ) : null}

        {project.lessons && project.lessons.length > 0 ? (
          <ProjectSection title={t.project.lessons}>
            <ProjectList items={project.lessons} />
          </ProjectSection>
        ) : null}

        {project.media ? (
          <ProjectSection title={t.project.media}>
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-dim">
              {project.media}
            </p>
          </ProjectSection>
        ) : null}

        {hasLinks ? (
          <ProjectSection title={t.project.links}>
            <ProjectLinks project={project} />
          </ProjectSection>
        ) : null}
      </div>
    </article>
  );
}
