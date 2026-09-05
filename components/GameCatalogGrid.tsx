"use client";

import Image from "next/image";
import type { GameItem } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import { withBasePath } from "@/lib/paths";

type GameCatalogGridProps = {
  games: GameItem[];
  heading?: string;
};

export function GameCatalogGrid({
  games,
  heading,
}: GameCatalogGridProps) {
  const { t } = useLanguage();
  const title = heading ?? t.project.games;

  if (games.length === 0) return null;

  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-heading mb-5 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const isExternal = /^https?:\/\//i.test(game.href);
          const href = isExternal ? game.href : withBasePath(game.href);
          const actionLabel = isExternal
            ? t.project.openGithub
            : t.project.playInBrowser;

          return (
            <a
              key={`${game.title}-${game.href}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-background-secondary">
                {game.image ? (
                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <p className="font-heading text-2xl font-semibold tracking-tight text-foreground/90">
                      {game.title}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-[11px] font-medium uppercase tracking-wider text-dim">
                  {game.platform}
                </p>
                <h3 className="font-heading mt-1.5 text-sm font-semibold text-foreground">
                  {game.title}
                </h3>
                {game.description ? (
                  <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">
                    {game.description}
                  </p>
                ) : null}
                <span className="mt-3 text-[13px] font-medium text-dim transition-colors group-hover:text-accent">
                  {actionLabel}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
