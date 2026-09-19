"use client";

import type { Project } from "@/lib/types";
import { GameCatalogGrid } from "@/components/GameCatalogGrid";
import { MediaAlbumGrid } from "@/components/MediaAlbumGrid";
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
import { withBasePath } from "@/lib/paths";

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
  const hasMediaAlbums = Boolean(
    localized.mediaAlbums && localized.mediaAlbums.length > 0,
  );
  const hasMediaImages = Boolean(
    localized.mediaImages && localized.mediaImages.length > 0,
  );

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

        {hasMediaAlbums || hasMediaImages || localized.media ? (
          <ProjectSection title={t.project.media}>
            {hasMediaAlbums ? (
              <MediaAlbumGrid
                projectSlug={localized.slug}
                albums={localized.mediaAlbums ?? []}
              />
            ) : null}

            {hasMediaImages ? (
              <div
                className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
                  hasMediaAlbums ? "mt-4" : ""
                }`}
              >
                {localized.mediaImages?.map((src, index) => (
                  <div
                    key={src}
                    className="overflow-hidden rounded-xl border border-border bg-background-secondary aspect-video"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export */}
                    <img
                      src={withBasePath(src)}
                      alt={`${localized.title} photo ${index + 1}`}
                      width={1600}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {localized.media && !hasMediaAlbums && !hasMediaImages ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-dim">
                {localized.media}
              </p>
            ) : localized.media ? (
              <p className="mt-3 text-sm text-dim">{localized.media}</p>
            ) : null}
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
