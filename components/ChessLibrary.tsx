"use client";

import { useMemo, useState } from "react";
import { ChessReplayer } from "@/components/ChessReplayer";
import { useLanguage } from "@/components/LanguageProvider";
import type { Locale } from "@/lib/i18n/config";
import {
  chessBrilliants,
  chessGames,
  chessRatings,
  type ChessReviewedGame,
  type ChessTimeClass,
} from "@/data/chess-review";

const CLOCKS: ChessTimeClass[] = ["bullet", "blitz", "rapid", "daily"];

const CLOCK_LABEL: Record<Locale, Record<ChessTimeClass, string>> = {
  en: { bullet: "Bullet", blitz: "Blitz", rapid: "Rapid", daily: "Daily" },
  zh: { bullet: "子彈棋", blitz: "快棋", rapid: "快速棋", daily: "通訊棋" },
};

function formatDate(date: string, locale: Locale): string {
  const [, month, day] = date.split("-");
  if (locale === "zh") return `${Number(month)}月${Number(day)}日`;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(month) - 1]} ${Number(day)}`;
}

function moveLabel(moveNumber: number, color: "w" | "b", san: string): string {
  return color === "w" ? `${moveNumber}. ${san}` : `${moveNumber}... ${san}`;
}

function RatingChart({ games }: { games: ChessReviewedGame[] }) {
  const points = games.filter((game) => game.userRating != null);
  if (points.length < 2) return null;
  const width = 320;
  const height = 72;
  const ratings = points.map((game) => game.userRating as number);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const span = Math.max(1, max - min);
  const path = points
    .map((game, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - 6 - ((game.userRating as number) - min) / span * (height - 12);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-16 w-full text-accent" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ChessLibrary() {
  const { t, locale } = useLanguage();
  const [part, setPart] = useState<"games" | "brilliants" | "ratings" | "board">("games");
  const [boardUrl, setBoardUrl] = useState<string | null>(null);
  const [boardMarks, setBoardMarks] = useState("");
  const [sort, setSort] = useState<"time" | "accuracy">("time");
  const [loadedPgn, setLoadedPgn] = useState<string | undefined>();
  const [loadedPly, setLoadedPly] = useState(0);
  const [loadToken, setLoadToken] = useState(0);

  const sortedGames = useMemo(() => {
    const next = chessGames.slice();
    if (sort === "accuracy") {
      next.sort((a, b) => {
        const sinkA = a.resigned && a.moveCount < 20 ? 1 : 0;
        const sinkB = b.resigned && b.moveCount < 20 ? 1 : 0;
        if (sinkA !== sinkB) return sinkA - sinkB;
        return (b.accuracy ?? -1) - (a.accuracy ?? -1) || b.endTime - a.endTime;
      });
    } else {
      next.sort((a, b) => b.endTime - a.endTime);
    }
    return next;
  }, [sort]);

  const gamesByClass = useMemo(() => {
    const grouped = {
      bullet: [] as ChessReviewedGame[],
      blitz: [] as ChessReviewedGame[],
      rapid: [] as ChessReviewedGame[],
      daily: [] as ChessReviewedGame[],
    };
    for (const game of chessGames) grouped[game.timeClass].push(game);
    for (const key of CLOCKS) grouped[key].sort((a, b) => a.endTime - b.endTime);
    return grouped;
  }, []);

  function openGame(gameId: string, ply = 0) {
    const game = chessGames.find((item) => item.id === gameId);
    if (!game) return;
    setBoardUrl(game.url);
    setBoardMarks(game.marks ?? "");
    setLoadedPgn(game.pgn);
    setLoadedPly(ply);
    setLoadToken((value) => value + 1);
    setPart("board");
  }

  function resultLabel(result: ChessReviewedGame["result"]): string {
    if (result === "win") return t.project.chessWin;
    if (result === "loss") return t.project.chessLoss;
    return t.project.chessDraw;
  }

  const choiceClass = (active: boolean) =>
    `rounded-md border px-2.5 py-1 text-[13px] font-medium transition-colors ${
      active
        ? "border-border-hover bg-card text-foreground"
        : "border-transparent text-dim hover:text-muted"
    }`;

  return (
    <>
      <section className="border-b border-border py-8">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {(
            [
              ["games", t.project.chessGames],
              ["brilliants", t.project.chessBrilliants],
              ["ratings", t.project.chessRatings],
              ["board", t.project.board],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPart(key)}
              className={choiceClass(part === key)}
            >
              {label}
            </button>
          ))}
        </div>
        {part === "games" ? (
          <>
        <p className="mb-4 text-sm leading-relaxed text-dim">{t.project.reviewedGamesNote}</p>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-dim">{t.project.sortBy}</span>
          {(["time", "accuracy"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={choiceClass(sort === key)}
            >
              {key === "time" ? t.project.sortTime : t.project.sortAccuracy}
            </button>
          ))}
        </div>
        <ul className="max-h-[32rem] divide-y divide-border overflow-y-auto rounded-xl border border-border">
          {sortedGames.map((game) => (
            <li key={game.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-foreground">
                  <span className="text-dim">{formatDate(game.date, locale)}</span>
                  {" · "}
                  {CLOCK_LABEL[locale][game.timeClass]}
                  {" · "}
                  <span
                    className={
                      game.result === "win"
                        ? "text-accent"
                        : game.result === "loss"
                          ? "text-[#e0a3a3]"
                          : "text-dim"
                    }
                  >
                    {resultLabel(game.result)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t.project.chessOpponent} {game.opponent}
                  {game.opponentRating != null ? ` (${game.opponentRating})` : ""}
                  {" · "}
                  {t.project.sortAccuracy}{" "}
                  {game.accuracy == null ? "—" : `${game.accuracy.toFixed(1)}%`}
                  {game.userRating != null ? ` · ${game.userRating}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openGame(game.id)}
                  className="h-9 rounded-lg bg-accent px-3 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  {t.project.viewGame}
                </button>
                <a
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-dim hover:text-foreground"
                >
                  {t.project.openOnChesscom}
                </a>
              </div>
            </li>
          ))}
        </ul>
          </>
        ) : null}

        {part === "brilliants" ? (
          <>
        <p className="mb-4 text-sm leading-relaxed text-dim">{t.project.brilliantNote}</p>
        <ol className="divide-y divide-border rounded-xl border border-border">
          {chessBrilliants.map((move, index) => (
            <li key={move.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="font-heading text-sm font-semibold text-foreground">
                  {index + 1}. {moveLabel(move.moveNumber, move.color, move.san)}
                  <span className="ml-2 font-sans text-[13px] font-medium text-accent">
                    +{move.benefit.toFixed(1)}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {formatDate(move.date, locale)}
                  {" · "}
                  {CLOCK_LABEL[locale][move.timeClass]}
                  {" · "}
                  {move.opponent}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openGame(move.gameId, move.ply)}
                  className="h-9 rounded-lg border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-card"
                >
                  {t.project.viewGame}
                </button>
                <a
                  href={move.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] text-dim hover:text-foreground"
                >
                  {t.project.openOnChesscom}
                </a>
              </div>
            </li>
          ))}
        </ol>
          </>
        ) : null}

        {part === "ratings" ? (
          <>
        <p className="mb-4 text-sm leading-relaxed text-dim">{t.project.ratingChartNote}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {CLOCKS.map((key) => {
            const record = chessRatings[key];
            const series = gamesByClass[key];
            return (
              <div key={key} className="rounded-xl border border-border bg-card px-4 py-4">
                <p className="text-[13px] font-medium text-dim">{CLOCK_LABEL[locale][key]}</p>
                <p className="font-heading mt-1 text-2xl font-semibold tracking-tight text-foreground">
                  {record.current}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t.project.chessBest} {record.best}
                  {" · "}
                  {t.project.chessRecord} {record.wins}-{record.losses}-{record.draws}
                </p>
                <RatingChart games={series} />
                <p className="mt-1 text-[12px] text-dim">
                  {series.length > 0
                    ? `${series[0].userRating ?? "—"} → ${series[series.length - 1].userRating ?? "—"}`
                    : null}
                </p>
              </div>
            );
          })}
        </div>
          </>
        ) : null}

        <div className={part === "board" ? "" : "hidden"}>
          {boardUrl ? (
            <p className="mb-4">
              <a
                href={boardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-dim hover:text-foreground"
              >
                {t.project.openOnChesscom}
              </a>
            </p>
          ) : null}
          <ChessReplayer
            loadedPgn={loadedPgn}
            loadedPly={loadedPly}
            loadToken={loadToken}
            marks={boardMarks}
          />
        </div>
      </section>
    </>
  );
}
