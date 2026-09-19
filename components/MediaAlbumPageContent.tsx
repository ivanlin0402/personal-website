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

export function MediaAlbumPageContent({
  project,
  album,
}: MediaAlbumPageContentProps) {
  const { t, locale } = useLanguage();
  const localized = localizeProject(project as ProjectWithI18n, locale);
  const localizedAlbum =
    localized.mediaAlbums?.find((item) => item.slug === album.slug) ?? album;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const total = localizedAlbum.images.length;

  function handleScroll() {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(total - 1, Math.max(0, next)));
  }

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
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

      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {localizedAlbum.images.map((src, index) => (
            <div
              key={src}
              className="relative aspect-square w-full shrink-0 snap-center snap-always bg-black"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export */}
              <img
                src={withBasePath(src)}
                alt={`${localizedAlbum.title} photo ${index + 1}`}
                width={1600}
                height={1600}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 h-full w-full object-contain object-center"
              />
            </div>
          ))}
        </div>
      </div>

      {total > 1 ? (
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[13px] text-dim">
            {activeIndex + 1} / {total}
          </p>
          <div className="flex items-center gap-1.5">
            {localizedAlbum.images.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`Go to photo ${index + 1}`}
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
