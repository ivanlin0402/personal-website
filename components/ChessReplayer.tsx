"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import { GameReviewPanel } from "@/components/GameReviewPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { StockfishClient } from "@/lib/engine/stockfishClient";
import { analyzeGame } from "@/lib/review/analyzeGame";
import { formatWhiteEval, whiteShare } from "@/lib/review/evaluation";
import { CLASS_MARK, type GameReview, type MoveReview } from "@/lib/review/reviewTypes";
import { isBookMove } from "@/lib/review/openingBook";

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
  whiteRating: number | null;
  blackRating: number | null;
  result: string;
  termination: string;
  error: string | null;
};

type EndSign = "fallen" | "throne" | "flag" | "half";

function ratingHeader(value: string | undefined): number | null {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? Math.round(rating) : null;
}

function parsePgn(pgn: string): ParsedGame {
  if (!pgn.trim()) {
    return { moves: [], white: "", black: "", whiteRating: null, blackRating: null, result: "*", termination: "", error: null };
  }
  const chess = new Chess();
  try {
    chess.loadPgn(pgn);
  } catch {
    return { moves: [], white: "", black: "", whiteRating: null, blackRating: null, result: "*", termination: "", error: "invalid" };
  }
  const headers = chess.getHeaders();
  return {
    moves: chess.history({ verbose: true }),
    white: headers.White && headers.White !== "?" ? headers.White : "",
    black: headers.Black && headers.Black !== "?" ? headers.Black : "",
    whiteRating: ratingHeader(headers.WhiteElo),
    blackRating: ratingHeader(headers.BlackElo),
    result: headers.Result ?? "*",
    termination: headers.Termination ?? "",
    error: null,
  };
}

function positionAt(moves: Move[], ply: number): Chess {
  const chess = new Chess();
  for (let index = 0; index < ply; index += 1) chess.move(moves[index].san);
  return chess;
}

/** Keep existing PGN tags and replace the movetext with the moves now on the board. */
function pgnFromMoves(source: string, sans: string[]): string {
  const chess = new Chess();
  let hadHeaders = false;
  if (source.trim()) {
    try {
      const seed = new Chess();
      seed.loadPgn(source);
      for (const [key, value] of Object.entries(seed.getHeaders())) {
        if (key === "Result" || key === "Termination" || value === "?" || value === "????.??.??") continue;
        hadHeaders = true;
        chess.setHeader(key, value);
      }
    } catch {
      // The board game is valid even if the textarea has not been loaded yet.
    }
  }
  for (const san of sans) chess.move(san);
  if (chess.isCheckmate()) chess.setHeader("Result", chess.turn() === "w" ? "0-1" : "1-0");
  else if (chess.isDraw()) chess.setHeader("Result", "1/2-1/2");
  else chess.setHeader("Result", "*");
  const text = chess.pgn({ maxWidth: 72 });
  if (hadHeaders) return text;
  return text.split(/\n\s*\n/).pop()?.trim() ?? text;
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

function endLabel(t: { project: { fallenKing: string; winningKing: string; resignedKing: string; drawnKing: string } }, kind: EndSign): string {
  if (kind === "fallen") return t.project.fallenKing;
  if (kind === "throne") return t.project.winningKing;
  if (kind === "flag") return t.project.resignedKing;
  return t.project.drawnKing;
}

function EndBadge({ kind, label }: { kind: EndSign; label: string }) {
  return (
    <span className={`chess-end chess-end--${kind}`} title={label} aria-label={label}>
      {kind === "fallen" ? <span className="chess-end__fallen">{GLYPH.k}</span> : null}
      {kind === "throne" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M2.6 18.4 6.2 6.2 9.4 13.4 12 1.6 14.6 13.4 17.8 6.2 21.4 18.4z"
          />
        </svg>
      ) : null}
      {kind === "flag" ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M6 2h2.2v20H6z" />
          <path fill="currentColor" d="M8.2 3.2h11.2L16.6 8l2.8 4.8H8.2z" />
        </svg>
      ) : null}
      {kind === "half" ? <span className="chess-end__half">½</span> : null}
    </span>
  );
}

type ChessReplayerProps = {
  loadedPgn?: string;
  loadedPly?: number;
  loadToken?: number;
  /** The loaded game ended because a player resigned. */
  resigned?: boolean;
  /** One letter per ply: R !! G ! S best E excellent C good I !? M ? X miss B ?? K book. */
  marks?: string;
};

export function ChessReplayer({
  loadedPgn,
  loadedPly = 0,
  loadToken = 0,
  resigned = false,
  marks = "",
}: ChessReplayerProps) {
  const { t, locale } = useLanguage();
  const [draft, setDraft] = useState("");
  const [pgn, setPgn] = useState("");
  const [ply, setPly] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [ghost, setGhost] = useState<{ type: PieceSymbol; white: boolean; x: number; y: number } | null>(null);
  const dragRef = useRef<{ from: Square; x: number; y: number; moved: boolean } | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [review, setReview] = useState<GameReview | null>(null);
  const [liveMoves, setLiveMoves] = useState<MoveReview[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [reviewFailed, setReviewFailed] = useState(false);
  const engineRef = useRef<StockfishClient | null>(null);
  const cancelRef = useRef(false);
  const runId = useRef(0);

  useEffect(() => {
    if (!loadedPgn || loadToken === 0) return;
    setDraft(loadedPgn);
    setPgn(loadedPgn);
    setPly(loadedPly);
    setPlaying(false);
    setLoadError(false);
  }, [loadedPgn, loadedPly, loadToken]);

  useEffect(() => {
    cancelRef.current = true;
    runId.current += 1;
    engineRef.current?.stop();
    setReview(null);
    setLiveMoves([]);
    setProgress(null);
    setRunning(false);
    setReviewFailed(false);
  }, [pgn]);

  useEffect(() => {
    return () => {
      engineRef.current?.quit();
    };
  }, []);

  const game = useMemo(() => parsePgn(pgn), [pgn]);
  const total = game.moves.length;
  const safePly = Math.min(ply, total);

  const position = useMemo(() => positionAt(game.moves, safePly), [game.moves, safePly]);
  const board = position.board();
  const sideToMove = position.turn();
  const legalTargets = useMemo(() => {
    const targets = new Map<Square, Move>();
    if (!selected || !position.get(selected)) return targets;
    for (const move of position.moves({ square: selected, verbose: true })) targets.set(move.to, move);
    return targets;
  }, [position, selected]);

  useEffect(() => {
    setSelected(null);
    setPromotion(null);
    setGhost(null);
    dragRef.current = null;
  }, [pgn, safePly]);

  const lastMove = safePly > 0 ? game.moves[safePly - 1] : null;
  const atEnd = total > 0 && safePly === total;
  const checkmate = position.isCheckmate();
  const headerDraw = game.result === "1/2-1/2" || game.result === "1/2";
  const resignedGame = /resign/i.test(game.termination) || (resigned && pgn === loadedPgn);
  const winner: "w" | "b" | null = game.result === "1-0" ? "w" : game.result === "0-1" ? "b" : null;
  const endSigns = new Map<Square, EndSign>();
  if (atEnd && checkmate) {
    const loser = position.turn();
    const mateWinner = loser === "w" ? "b" : "w";
    const lostSquare = position.findPiece({ type: "k", color: loser })[0];
    const wonSquare = position.findPiece({ type: "k", color: mateWinner })[0];
    if (lostSquare) endSigns.set(lostSquare, "fallen");
    if (wonSquare) endSigns.set(wonSquare, "throne");
  } else if (atEnd && (headerDraw || position.isDraw())) {
    for (const color of ["w", "b"] as const) {
      const square = position.findPiece({ type: "k", color })[0];
      if (square) endSigns.set(square, "half");
    }
  } else if (atEnd && resignedGame && winner) {
    const loser = winner === "w" ? "b" : "w";
    const lostSquare = position.findPiece({ type: "k", color: loser })[0];
    const wonSquare = position.findPiece({ type: "k", color: winner })[0];
    if (lostSquare) endSigns.set(lostSquare, "flag");
    if (wonSquare) endSigns.set(wonSquare, "throne");
  }
  const liveMove = liveMoves[safePly - 1];
  function theoryMark(index: number): string {
    const san = game.moves[index]?.san;
    if (!san) return "";
    return isBookMove(
      game.moves.slice(0, index).map((move) => move.san),
      san,
    )
      ? "K"
      : "";
  }
  const moveMark = liveMove
    ? CLASS_MARK[liveMove.classification]
    : theoryMark(safePly - 1) ||
      (liveMoves.length === 0 && pgn === loadedPgn && safePly > 0 ? (marks[safePly - 1] ?? "") : "");
  const shownEval = liveMove
    ? liveMove.evaluationAfter
    : liveMoves[0] && safePly === 0
      ? liveMoves[0].evaluationBefore
      : null;
  const showArrow =
    liveMove != null &&
    liveMove.bestUci !== liveMove.uci &&
    (liveMove.classification === "inaccuracy" ||
      liveMove.classification === "mistake" ||
      liveMove.classification === "miss" ||
      liveMove.classification === "blunder");

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

  async function reviewCurrentGame() {
    if (running || total === 0) return;
    const id = ++runId.current;
    cancelRef.current = false;
    setReviewFailed(false);
    setReview(null);
    setLiveMoves([]);
    setRunning(true);
    setPlaying(false);
    const client = engineRef.current ?? new StockfishClient();
    engineRef.current = client;
    try {
      const result = await analyzeGame(
        game.moves,
        client,
        (done, count, move, replace) => {
          if (cancelRef.current || runId.current !== id) return;
          setProgress({ done, total: count });
          if (!move) return;
          setLiveMoves((current) =>
            replace ? current.map((item) => (item.ply === move.ply ? move : item)) : [...current, move],
          );
        },
        () => cancelRef.current,
        pgn === loadedPgn ? marks : "",
        { whiteRating: game.whiteRating, blackRating: game.blackRating },
      );
      if (!cancelRef.current && runId.current === id) setReview(result);
    } catch (error) {
      const cancelled = error instanceof Error && error.message === "cancelled";
      if (!cancelled && !cancelRef.current && runId.current === id) setReviewFailed(true);
    } finally {
      if (runId.current === id) {
        setRunning(false);
        setProgress(null);
      }
    }
  }

  function cancelReview() {
    cancelRef.current = true;
    engineRef.current?.stop();
  }

  function goTo(next: number) {
    setPlaying(false);
    setPly(Math.min(total, Math.max(0, next)));
  }

  function playMove(from: Square, to: Square, promote?: PieceSymbol) {
    const chess = positionAt(game.moves, safePly);
    const choices = chess.moves({ square: from, verbose: true }).filter((move) => move.to === to);
    if (choices.length === 0) return;
    if (choices.some((move) => move.promotion) && !promote) {
      setPromotion({ from, to });
      setSelected(from);
      return;
    }
    const chosen = promote ? choices.find((move) => move.promotion === promote) : choices[0];
    if (!chosen) return;
    chess.move({ from, to, promotion: promote ?? chosen.promotion });
    const nextPgn = pgnFromMoves(pgn, chess.history());
    setLoadError(false);
    setDraft(nextPgn);
    setPgn(nextPgn);
    setPly(chess.history().length);
    setSelected(null);
    setPromotion(null);
  }

  function onSquarePointerDown(event: React.PointerEvent<HTMLButtonElement>, square: Square) {
    if (event.button !== 0) return;
    setPlaying(false);
    const piece = position.get(square);
    if (selected && legalTargets.has(square)) {
      playMove(selected, square);
      return;
    }
    if (!piece || piece.color !== sideToMove) {
      setSelected(null);
      setPromotion(null);
      return;
    }
    setSelected(square);
    setPromotion(null);
    dragRef.current = { from: square, x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onSquarePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 5) return;
    drag.moved = true;
    const piece = position.get(drag.from);
    if (!piece) return;
    setGhost({ type: piece.type, white: piece.color === "w", x: event.clientX, y: event.clientY });
  }

  function onSquarePointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    setGhost(null);
    if (!drag?.moved) return;
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const square = target?.closest("[data-square]")?.getAttribute("data-square");
    if (square) playMove(drag.from, square as Square);
  }

  function markFor(index: number): string {
    const live = liveMoves[index];
    if (live) return CLASS_MARK[live.classification];
    const theory = theoryMark(index);
    if (theory) return theory;
    if (liveMoves.length === 0 && pgn === loadedPgn) return marks[index] ?? "";
    return "";
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
    <>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,38rem)_minmax(18rem,1fr)]">
      <div className="min-w-0 w-full max-w-[min(38rem,calc(100dvh-8.5rem))] lg:sticky lg:top-[4.5rem] lg:z-10 lg:self-start">
        <div className="flex items-stretch gap-2">
          {shownEval ? (
            <div className="flex w-9 shrink-0 flex-col items-center py-3">
              <span className="mb-1 text-[11px] font-medium text-foreground">{formatWhiteEval(shownEval)}</span>
              <div className="relative w-2.5 flex-1 overflow-hidden rounded-full bg-[#3a2a1c]" title={formatWhiteEval(shownEval)}>
                <div className="absolute inset-x-0 bottom-0 bg-[#f4efe4]" style={{ height: `${whiteShare(shownEval)}%` }} />
              </div>
            </div>
          ) : null}
          <div className="relative min-w-0 flex-1 overflow-hidden rounded-xl border border-[#2c3d55] bg-[#121a28] p-3 sm:p-4">
          <div className="relative grid grid-cols-8 overflow-hidden rounded-md">
            {board.map((rank, rankIndex) =>
              rank.map((piece, fileIndex) => {
                const square = `${FILES[fileIndex]}${8 - rankIndex}` as Square;
                const light = (rankIndex + fileIndex) % 2 === 0;
                const active = lastMove?.from === square || lastMove?.to === square;
                const target = legalTargets.get(square);
                const movable = piece?.color === sideToMove;
                return (
                  <button
                    key={square}
                    type="button"
                    data-square={square}
                    aria-label={square}
                    onPointerDown={(event) => onSquarePointerDown(event, square)}
                    onPointerMove={onSquarePointerMove}
                    onPointerUp={onSquarePointerUp}
                    className={`chess-square relative flex aspect-square items-center justify-center overflow-hidden border-0 p-0 ${
                      movable ? "cursor-grab" : "cursor-default"
                    } ${
                      active
                        ? light
                          ? "bg-[#d5dde8]"
                          : "bg-[#5d84b8]"
                        : light
                          ? "bg-[#c5ced8]"
                          : "bg-[#3f6294]"
                    } ${selected === square ? "shadow-[inset_0_0_0_3px_#e7c34b]" : ""}`}
                  >
                    {piece ? (
                      <span
                        className={`chess-piece pointer-events-none bg-clip-text font-heading leading-none text-transparent ${
                          ghost && selected === square ? "opacity-30" : ""
                        } ${
                          piece.color === "w"
                            ? "bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f6f5f3] [-webkit-text-stroke:1px_#9aa3ad]"
                            : "bg-gradient-to-br from-[#1c1c1c] via-[#050505] to-[#000000] [-webkit-text-stroke:1px_#c9ced6]"
                        }`}
                      >
                        {GLYPH[piece.type]}
                      </span>
                    ) : null}
                    {endSigns.get(square) ? (
                      <EndBadge kind={endSigns.get(square) as EndSign} label={endLabel(t, endSigns.get(square) as EndSign)} />
                    ) : null}
                    {target ? (
                      <span
                        className={`pointer-events-none absolute rounded-full ${
                          target.captured
                            ? "h-[86%] w-[86%] border-[6px] border-black/25"
                            : "h-[28%] w-[28%] bg-black/25"
                        }`}
                      />
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
                  </button>
                );
              }),
            )}
            {showArrow && liveMove ? (
              <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 8 8" aria-hidden="true">
                <BestArrow uci={liveMove.bestUci} />
              </svg>
            ) : null}
          </div>
        </div>
        </div>

        {promotion ? (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-[13px] text-dim">{t.project.promoteTo}</span>
            {(["q", "r", "b", "n"] as const).map((piece) => (
              <button
                key={piece}
                type="button"
                aria-label={t.project.promotePiece[piece]}
                onClick={() => playMove(promotion.from, promotion.to, piece)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-border text-3xl leading-none ${
                  sideToMove === "w" ? "bg-[#1c1c1c] text-[#f7f7f5]" : "bg-[#f4f1ea] text-[#111111]"
                }`}
              >
                {GLYPH[piece]}
              </button>
            ))}
          </div>
        ) : null}

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

        <GameReviewPanel
          locale={locale}
          review={review}
          move={liveMove ?? null}
          progress={progress}
          running={running}
          failed={reviewFailed}
          failedLabel={t.project.reviewFailed}
          onReview={() => void reviewCurrentGame()}
          onCancel={cancelReview}
          reviewLabel={t.project.reviewGame}
          cancelLabel={t.project.cancelReview}
          analyzingLabel={t.project.analyzingGame}
          accuracyLabel={t.project.engineAccuracy}
          beforeLabel={t.project.evalBefore}
          afterLabel={t.project.evalAfter}
          bestLabel={t.project.bestMoveLabel}
          bestLineLabel={t.project.bestLineLabel}
          showLineLabel={t.project.showFullLine}
          hideLineLabel={t.project.hideFullLine}
          debugLabel={t.project.reviewDebug}
          onJump={goTo}
        />

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
                  <MoveListMark code={markFor(pair.number * 2 - 2)} />
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
                  <MoveListMark code={markFor(pair.number * 2 - 1)} />
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
          ) : (
            <p className="text-[13px] text-dim">{t.project.exampleNote}</p>
          )}
        </div>
      </div>
    </div>
    {ghost ? (
      <span
        className={`pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 text-5xl leading-none ${
          ghost.white ? "text-[#f7f7f5] [text-shadow:0_0_1px_#111]" : "text-[#111111] [text-shadow:0_0_1px_#ddd]"
        }`}
        style={{ left: ghost.x, top: ghost.y }}
      >
        {GLYPH[ghost.type]}
      </span>
    ) : null}
    </>
  );
}

const MARK_NAME: Record<string, string> = {
  R: "Brilliant",
  G: "Great",
  S: "Best",
  E: "Excellent",
  C: "Good",
  I: "Inaccuracy",
  M: "Mistake",
  X: "Miss",
  B: "Blunder",
  K: "Book",
};

function MoveListMark({ code }: { code: string }) {
  const style = MOVE_MARK[code];
  if (!style) return null;
  return (
    <span
      title={MARK_NAME[code] ?? code}
      className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none"
      style={{ backgroundColor: style.color, color: style.ink }}
    >
      <span className="inline-flex h-2.5 w-2.5 items-center justify-center [&>svg]:h-2.5 [&>svg]:w-2.5">
        <MarkGlyph code={code} />
      </span>
    </span>
  );
}

function BestArrow({ uci }: { uci: string }) {
  const from = squarePoint(uci.slice(0, 2));
  const to = squarePoint(uci.slice(2, 4));
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const end = { x: from.x + (dx / length) * (length - 0.45), y: from.y + (dy / length) * (length - 0.45) };
  return (
    <>
      <defs>
        <marker id="best-arrow" markerWidth="3" markerHeight="3" refX="1.4" refY="1.5" orient="auto">
          <path d="M0 0 L3 1.5 L0 3 z" fill="#f0c329" />
        </marker>
      </defs>
      <line
        x1={from.x}
        y1={from.y}
        x2={end.x}
        y2={end.y}
        stroke="#f0c329"
        strokeWidth="0.14"
        markerEnd="url(#best-arrow)"
      />
    </>
  );
}

function squarePoint(square: string): { x: number; y: number } {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return { x: file + 0.5, y: 8 - rank + 0.5 };
}
