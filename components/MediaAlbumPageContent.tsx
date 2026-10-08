"use client";

import { useRef, useState } from "react";
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

type MediaItem =
  | { kind: "video"; src: string }
  | { kind: "image"; src: string };

function albumItems(album: MediaAlbum): MediaItem[] {
  const videos = (album.videos ?? []).map((src) => ({
    kind: "video" as const,
    src,
  }));
  const images = album.images.map((src) => ({ kind: "image" as const, src }));
  return [...videos, ...images];
}

function isVideoPath(src: string) {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(src);
}

export function MediaAlbumPageContent({
  project,
  album,
}: MediaAlbumPageContentProps) {
  const { t, locale } = useLanguage();
  const localized = localizeProject(project as ProjectWithI18n, locale);
  const localizedAlbum =
    localized.mediaAlbums?.find((item) => item.slug === album.slug) ?? album;
  const items = albumItems(localizedAlbum);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = items.length;
  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < total - 1;
  const poster =
    [localizedAlbum.cover, localizedAlbum.images[0]]
      .filter((src): src is string => Boolean(src))
      .find((src) => !isVideoPath(src)) ?? undefined;

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(total - 1, Math.max(0, next)));
  }

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.min(total - 1, Math.max(0, index));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setActiveIndex(clamped);
  }

  return (
    <div className="container-narrow py-12 sm:py-16">
      <Link
        href={`/projects/${project.slug}`}
        className="mb-8 inline-flex text-[13px] text-dim transition-colors duration-200 hover:text-muted"
      >
        {t.project.backToProject}
      </Link>

      <header className="mb-6">
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

      <div className="relative overflow-hidden rounded-xl border border-border bg-black">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <div
              key={`${item.kind}-${item.src}`}
              className={`relative w-full shrink-0 snap-center snap-always bg-black ${
                item.kind === "video" ? "aspect-video" : "aspect-square"
              }`}
            >
              {item.kind === "video" ? (
                <video
                  src={withBasePath(item.src)}
                  controls
                  playsInline
                  preload="none"
                  poster={poster ? withBasePath(poster) : undefined}
                  className="absolute inset-0 h-full w-full object-contain object-center"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export
                <img
                  src={withBasePath(item.src)}
                  alt={`${localizedAlbum.title} photo ${index + 1}`}
                  width={1280}
                  height={1280}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain object-center"
                />
              )}
            </div>
          ))}
        </div>

        {canGoPrev ? (
          <button
            type="button"
            aria-label={t.project.previousPhoto}
            onClick={() => scrollToIndex(activeIndex - 1)}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm transition-colors active:bg-black/75 sm:h-11 sm:w-11"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : null}

        {canGoNext ? (
          <button
            type="button"
            aria-label={t.project.nextPhoto}
            onClick={() => scrollToIndex(activeIndex + 1)}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm transition-colors active:bg-black/75 sm:h-11 sm:w-11"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[13px] text-dim">
            {activeIndex + 1} / {total}
          </p>
          <div className="flex items-center gap-1.5">
            {items.map((item, index) => (
              <button
                key={`${item.kind}-${item.src}-dot`}
                type="button"
                aria-label={`Go to item ${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "w-5 bg-foreground"
                    : "w-1.5 bg-border hover:bg-dim"
                }`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
