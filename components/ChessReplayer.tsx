"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess, type Move, type PieceSymbol } from "chess.js";
import { useLanguage } from "@/components/LanguageProvider";

const EXAMPLE_PGN = `[Event "Example"]
[White "Example"]
[Black "Example"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

const GLYPH: Record<PieceSymbol, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

type ParsedGame = {
  moves: Move[];
  white: string;
  black: string;
  error: string | null;
};

function parsePgn(pgn: string): ParsedGame {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return { moves: [], white: "", black: "", error: "invalid" };
  }
  const headers = chess.getHeaders();
  return {
    moves: chess.history({ verbose: true }),
    white: headers.White ?? "",
    black: headers.Black ?? "",
    error: null,
  };
}

const MOVE_MARK: Record<string, { text?: string; color: string; ink: string }> = {
  R: { text: "!!", color: "#00c2d1", ink: "#ffffff" },
  G: { text: "!", color: "#3b82f6", ink: "#ffffff" },
  S: { color: "#6fbf3a", ink: "#ffffff" },
  E: { color: "#6fbf3a", ink: "#ffffff" },
  C: { color: "#6fbf3a", ink: "#ffffff" },
  I: { text: "!?", color: "#f5c400", ink: "#1c1400" },
  M: { text: "?", color: "#f08a24", ink: "#1c1400" },
  X: { color: "#e23b3b", ink: "#ffffff" },
  B: { text: "??", color: "#e23b3b", ink: "#ffffff" },
  K: { color: "#8b5a2b", ink: "#fff6ea" },
};

function MarkGlyph({ code }: { code: string }) {
  if (code === "S") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 1.8l2.6 7.2h7.5l-6.1 4.5 2.3 7.2L12 16.4 5.7 20.7l2.3-7.2L1.9 9h7.5z"
        />
      </svg>
    );
  }
  if (code === "E") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M8.2 10.2V21H5.2V10.2h3zm2.1 10.8V10.6l2.4-5.6c.25-.6.85-1 1.48-.95.78.06 1.32.76 1.22 1.54l-.35 2.71h4.55c.95 0 1.68.85 1.55 1.79l-1.05 7.1a1.6 1.6 0 0 1-1.58 1.37H10.3z"
        />
      </svg>
    );
  }
  if (code === "C") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.5 12.5l5 5.2L19.5 6.5"
        />
      </svg>
    );
  }
  if (code === "K") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4.2 5.2C4.2 4 5.2 3 6.4 3H12v16.2H6.2A2 2 0 0 1 4.2 17.2V5.2z"
        />
        <path
          fill="currentColor"
          d="M19.8 5.2C19.8 4 18.8 3 17.6 3H12v16.2h5.8a2 2 0 0 0 2-2V5.2z"
        />
        <path fill="#5c3312" d="M11.15 3.2h1.7v15.8h-1.7z" />
      </svg>
    );
  }
  if (code === "X") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          d="M6 6l12 12M18 6L6 18"
        />
      </svg>
    );
  }
  return MOVE_MARK[code]?.text ?? null;
}

type ChessReplayerProps = {
  loadedPgn?: string;
  loadedPly?: number;
  loadToken?: number;
  /** One letter per ply: R !! G ! S best E excellent C good I !? M ? X miss B ?? K book. */
  marks?: string;
};

export function ChessReplayer({
  loadedPgn,
  loadedPly = 0,
  loadToken = 0,
  marks = "",
}: ChessReplayerProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState(EXAMPLE_PGN);
  const [pgn, setPgn] = useState(EXAMPLE_PGN);
  const [ply, setPly] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!loadedPgn || loadToken === 0) return;
    setDraft(loadedPgn);
    setPgn(loadedPgn);
    setPly(loadedPly);
    setPlaying(false);
    setLoadError(false);
  }, [loadedPgn, loadedPly, loadToken]);

  const game = useMemo(() => parsePgn(pgn), [pgn]);
  const total = game.moves.length;
  const safePly = Math.min(ply, total);

  const board = useMemo(() => {
    const chess = new Chess();
    for (let index = 0; index < safePly; index += 1) {
      chess.move(game.moves[index].san);
    }
    return chess.board();
  }, [game.moves, safePly]);

  const lastMove = safePly > 0 ? game.moves[safePly - 1] : null;
  const moveMark =
    pgn === loadedPgn && safePly > 0 ? marks[safePly - 1] ?? "" : "";

  useEffect(() => {
    if (!playing) return;
    if (safePly >= total) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setPly((value) => value + 1), 700);
    return () => window.clearTimeout(timer);
  }, [playing, safePly, total]);

  function loadDraft() {
    const next = parsePgn(draft);
    if (next.error) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    setPgn(draft);
    setPly(0);
    setPlaying(false);
  }

  function goTo(next: number) {
    setPlaying(false);
    setPly(Math.min(total, Math.max(0, next)));
  }

  const pairs: Array<{ number: number; white?: Move; black?: Move }> = [];
  for (let index = 0; index < total; index += 2) {
    pairs.push({
      number: index / 2 + 1,
      white: game.moves[index],
      black: game.moves[index + 1],
    });
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,46rem)_minmax(16rem,22rem)]">
      <div>
        <div className="overflow-hidden rounded-xl border border-[#2c3d55] bg-[#121a28] p-3 sm:p-4">
          <div className="grid grid-cols-8 overflow-hidden rounded-md">
            {board.map((rank, rankIndex) =>
              rank.map((piece, fileIndex) => {
                const square = `${FILES[fileIndex]}${8 - rankIndex}`;
                const light = (rankIndex + fileIndex) % 2 === 0;
                const active =
                  lastMove?.from === square || lastMove?.to === square;
                return (
                  <div
                    key={square}
                    className={`chess-square relative flex aspect-square items-center justify-center overflow-hidden ${
                      active
                        ? light
                          ? "bg-[#d5dde8]"
                          : "bg-[#5d84b8]"
                        : light
                          ? "bg-[#c5ced8]"
                          : "bg-[#3f6294]"
                    }`}
                  >
                    {piece ? (
                      <span
                        className={`chess-piece bg-clip-text font-heading leading-none text-transparent ${
                          piece.color === "w"
                            ? "bg-gradient-to-br from-[#f8edd8] via-[#e2c396] to-[#c49662] [-webkit-text-stroke:1px_#6a4a28]"
                            : "bg-gradient-to-br from-[#a86b3a] via-[#6b3e1c] to-[#4a2912] [-webkit-text-stroke:1px_#f0ddc0]"
                        }`}
                      >
                        {GLYPH[piece.type]}
                      </span>
                    ) : null}
                    {moveMark && MOVE_MARK[moveMark] && lastMove?.to === square ? (
                      <span
                        className={`chess-mark ${fileIndex === 0 ? "chess-mark--rank" : "chess-mark--edge"} ${
                          (MOVE_MARK[moveMark].text?.length ?? 0) > 1 ? "chess-mark--wide" : ""
                        }`}
                        style={{
                          backgroundColor: MOVE_MARK[moveMark].color,
                          color: MOVE_MARK[moveMark].ink,
                        }}
                      >
                        <MarkGlyph code={moveMark} />
                      </span>
                    ) : null}
                    {rankIndex === 7 ? (
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-medium text-white/55">
                        {FILES[fileIndex]}
                      </span>
                    ) : null}
                    {fileIndex === 0 ? (
                      <span className="absolute left-1 top-0.5 text-[9px] font-medium text-white/55">
                        {8 - rankIndex}
                      </span>
                    ) : null}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => goTo(0)}
            className="h-10 rounded-lg border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-card"
          >
            {t.project.toStart}
          </button>
          <button
            type="button"
            aria-label={t.project.previousMove}
            onClick={() => goTo(safePly - 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-card"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => {
              if (safePly >= total) setPly(0);
              setPlaying((value) => !value);
            }}
            className="h-10 rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {playing ? t.project.pause : t.project.play}
          </button>
          <button
            type="button"
            aria-label={t.project.nextMove}
            onClick={() => goTo(safePly + 1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-card"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => goTo(total)}
            className="h-10 rounded-lg border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-card"
          >
            {t.project.toEnd}
          </button>
          <p className="text-[13px] text-dim">
            {safePly === 0
              ? t.project.startingPosition
              : `${safePly} / ${total}`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-foreground">
            <span className="text-dim">{t.project.white}</span>{" "}
            {game.white || "—"}
          </p>
          <p className="mt-1 text-sm text-foreground">
            <span className="text-dim">{t.project.black}</span>{" "}
            {game.black || "—"}
          </p>
        </div>

        <ol className="max-h-[32rem] overflow-y-auto rounded-xl border border-border bg-card p-3 text-sm">
          {pairs.map((pair) => (
            <li key={pair.number} className="grid grid-cols-[2rem_1fr_1fr] gap-2 py-0.5">
              <span className="text-dim">{pair.number}.</span>
              {pair.white ? (
                <button
                  type="button"
                  onClick={() => goTo(pair.number * 2 - 1)}
                  className={`rounded px-1 text-left ${
                    safePly === pair.number * 2 - 1
                      ? "bg-accent-soft text-accent"
                      : "text-foreground hover:bg-background-secondary"
                  }`}
                >
                  {pair.white.san}
                </button>
              ) : (
                <span />
              )}
              {pair.black ? (
                <button
                  type="button"
                  onClick={() => goTo(pair.number * 2)}
                  className={`rounded px-1 text-left ${
                    safePly === pair.number * 2
                      ? "bg-accent-soft text-accent"
                      : "text-foreground hover:bg-background-secondary"
                  }`}
                >
                  {pair.black.san}
                </button>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ol>

        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-dim">
            {t.project.pgnLabel}
          </span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            rows={8}
            className="w-full resize-y rounded-xl border border-border bg-background-secondary px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground outline-none focus:border-border-hover"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadDraft}
            className="h-10 rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {t.project.loadPgn}
          </button>
          {loadError ? (
            <p className="text-[13px] text-[#e0a3a3]">{t.project.invalidPgn}</p>
          ) : pgn === EXAMPLE_PGN ? (
            <p className="text-[13px] text-dim">{t.project.exampleNote}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
