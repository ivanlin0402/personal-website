"use client";

import Link from "next/link";
import type { MediaAlbum } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { withBasePath } from "@/lib/paths";

type MediaAlbumGridProps = {
  projectSlug: string;
  albums: MediaAlbum[];
};

function isVideoPath(src: string) {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(src);
}

export function MediaAlbumGrid({ projectSlug, albums }: MediaAlbumGridProps) {
  const { t } = useLanguage();

  if (albums.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {albums.map((album) => {
        // Prefer a still cover — never load a video file into the project page grid.
        const cover = [album.cover, album.images[0]]
          .filter((src): src is string => Boolean(src))
          .find((src) => !isVideoPath(src));
        const href = `/projects/${projectSlug}/media/${album.slug}`;
        const videoOnly =
          (album.videos?.length ?? 0) > 0 && album.images.length === 0;

        return (
          <Link
            key={album.slug}
            href={href}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
          >
            <div className="relative aspect-square overflow-hidden border-b border-border bg-black">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export
                <img
                  src={withBasePath(cover)}
                  alt={album.title}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-background-secondary text-dim">
                  <span className="text-sm font-medium">
                    {videoOnly ? "Video" : "Media"}
                  </span>
                </div>
              )}
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
                {videoOnly ? t.project.viewVideo : t.project.viewPhotos}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
