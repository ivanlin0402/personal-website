"use client";

import Link from "next/link";
import type { MediaAlbum, Project } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeProject } from "@/lib/i18n/project";
import type { ProjectWithI18n } from "@/lib/i18n/project";
import { withBasePath } from "@/lib/paths";

type MediaAlbumPageContentProps = {
  project: Project | ProjectWithI18n;
  album: MediaAlbum;
};

export function MediaAlbumPageContent({
  project,
  album,
}: MediaAlbumPageContentProps) {
  const { t, locale } = useLanguage();
  const localized = localizeProject(project as ProjectWithI18n, locale);
  const localizedAlbum =
    localized.mediaAlbums?.find((item) => item.slug === album.slug) ?? album;

  return (
    <div className="container-narrow py-12 sm:py-16">
      <Link
        href={`/projects/${project.slug}`}
        className="mb-8 inline-flex text-[13px] text-dim transition-colors duration-200 hover:text-muted"
      >
        {t.project.backToProject}
      </Link>

      <header className="mb-8">
        <p className="text-[11px] font-medium uppercase tracking-wider text-dim">
          {localized.title}
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {localizedAlbum.title}
        </h1>
        {localizedAlbum.description ? (
          <p className="mt-3 text-base leading-relaxed text-muted">
            {localizedAlbum.description}
          </p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {localizedAlbum.images.map((src, index) => (
          <div
            key={src}
            className="overflow-hidden rounded-xl border border-border bg-background-secondary aspect-video"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export */}
            <img
              src={withBasePath(src)}
              alt={`${localizedAlbum.title} photo ${index + 1}`}
              width={1600}
              height={900}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
