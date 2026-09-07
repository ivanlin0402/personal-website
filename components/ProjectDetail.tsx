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
import { localizeProject } from "@/lib/i18n/project";
import type { ProjectWithI18n } from "@/lib/i18n/project";

type ProjectDetailProps = {
  project: Project | ProjectWithI18n;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { t, locale } = useLanguage();
  const localized = localizeProject(project, locale);
  const hasLinks =
    Boolean(localized.githubUrl) ||
    Boolean(localized.demoUrl) ||
    Boolean(localized.documentationUrl);

  return (
    <article>
      <ProjectHeader project={localized} />

      <div className="mt-2">
        {localized.overview ? (
          <ProjectSection title={t.project.overview}>
            <ProjectParagraph>{localized.overview}</ProjectParagraph>
          </ProjectSection>
        ) : null}

        {localized.updates && localized.updates.length > 0 ? (
          <ProjectSection title={t.project.timeline}>
            <ProjectTimeline updates={localized.updates} />
          </ProjectSection>
        ) : null}

        {localized.games && localized.games.length > 0 ? (
          <GameCatalogGrid games={localized.games} />
        ) : null}

        {localized.goals && localized.goals.length > 0 ? (
          <ProjectSection title={t.project.goals}>
            <ProjectList items={localized.goals} />
          </ProjectSection>
        ) : null}

        {localized.process && localized.process.length > 0 ? (
          <ProjectSection title={t.project.process}>
            <ProjectList items={localized.process} />
          </ProjectSection>
        ) : null}

        {localized.technicalDetails && localized.technicalDetails.length > 0 ? (
          <ProjectSection title={t.project.technicalDetails}>
            <ProjectList items={localized.technicalDetails} />
          </ProjectSection>
        ) : null}

        {localized.results && localized.results.length > 0 ? (
          <ProjectSection title={t.project.results}>
            <ProjectList items={localized.results} />
          </ProjectSection>
        ) : null}

        {localized.lessons && localized.lessons.length > 0 ? (
          <ProjectSection title={t.project.lessons}>
            <ProjectList items={localized.lessons} />
          </ProjectSection>
        ) : null}

        {localized.media ? (
          <ProjectSection title={t.project.media}>
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-dim">
              {localized.media}
            </p>
          </ProjectSection>
        ) : null}

        {hasLinks ? (
          <ProjectSection title={t.project.links}>
            <ProjectLinks project={localized} />
          </ProjectSection>
        ) : null}
      </div>
    </article>
  );
}
