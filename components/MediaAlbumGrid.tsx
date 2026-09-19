"use client";

import Link from "next/link";
import type { MediaAlbum } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { withBasePath } from "@/lib/paths";

type MediaAlbumGridProps = {
  projectSlug: string;
  albums: MediaAlbum[];
};

export function MediaAlbumGrid({ projectSlug, albums }: MediaAlbumGridProps) {
  const { t } = useLanguage();

  if (albums.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {albums.map((album) => {
        const cover = album.cover ?? album.images[0];
        const href = `/projects/${projectSlug}/media/${album.slug}`;

        return (
          <Link
            key={album.slug}
            href={href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
          >
            <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-background-secondary">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export
                <img
                  src={withBasePath(cover)}
                  alt={album.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
              ) : null}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {album.title}
              </h3>
              {album.description ? (
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                  {album.description}
                </p>
              ) : null}
              <span className="mt-3 text-[13px] font-medium text-dim transition-colors group-hover:text-accent">
                {t.project.viewPhotos}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
