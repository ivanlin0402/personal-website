import type { GameItem } from "@/lib/types";

type GameCatalogGridProps = {
  games: GameItem[];
  heading?: string;
};

/**
 * Retrogames.cc-inspired catalog grid:
 * platform label on top, game title, optional blurb, full-tile click target.
 */
export function GameCatalogGrid({
  games,
  heading = "Games",
}: GameCatalogGridProps) {
  if (games.length === 0) return null;

  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-heading mb-5 text-lg font-semibold tracking-tight text-foreground">
        {heading}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <a
            key={`${game.title}-${game.href}`}
            href={game.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
          >
            {/* Visual plate — catalog “cover” area */}
            <div className="relative flex aspect-[4/3] items-center justify-center border-b border-border bg-background-secondary">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,140,255,0.08),transparent_65%)]" />
              <div className="relative px-4 text-center">
                <p className="font-heading text-2xl font-semibold tracking-tight text-foreground/90 transition-colors group-hover:text-accent">
                  {game.title}
                </p>
              </div>
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
                Open on GitHub →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
