import { Chess, type Move, type PieceSymbol, type Square } from "chess.js";
import { brilliantVerdict, detectSacrificeCandidate, getBrilliantThresholds, pieceLetter } from "@/lib/review/brilliant";
import {
  centipawnLoss,
  formatWhiteEval,
  moveAccuracyFromLoss,
  overallAccuracy,
  playerExpectedScore,
  positionImportance,
  toPlayerEval,
  toWhiteEval,
  winChanceLoss,
} from "@/lib/review/evaluation";
import type { SideScore } from "@/lib/review/evaluation";
import { reviewConfig } from "@/lib/review/reviewConfig";
import { classifyMove } from "@/lib/review/classifyMove";
import { isBookMove } from "@/lib/review/openingBook";
import {
  CLASSIFICATIONS,
  type Classification,
  type GameReview,
  type MoveFeatures,
  type MoveReview,
  type ReviewSummary,
  type SacrificeKind,
  type SacrificedPiece,
  type WhiteEval,
} from "@/lib/review/reviewTypes";

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

export type EngineLine = {
  depth: number;
  multipv: number;
  score: SideScore;
  move: string;
  pv: string[];
};

export type EngineSearch = {
  best: EngineLine | null;
  second: EngineLine | null;
  third: EngineLine | null;
  lines: EngineLine[];
};

export type SearchOptions = {
  depth?: number;
  multiPv?: number;
};

export type ReviewEngine = {
  search: (fen: string, options?: SearchOptions) => Promise<EngineSearch>;
};

function emptySummary(): ReviewSummary {
  return {
    brilliant: 0,
    great: 0,
    best: 0,
    book: 0,
    excellent: 0,
    good: 0,
    inaccuracy: 0,
    mistake: 0,
    miss: 0,
    blunder: 0,
  };
}

function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

function sanFor(fen: string, uci: string): string {
  const chess = new Chess(fen);
  const played = chess.move(uciToMove(uci));
  return played?.san ?? uci;
}

function sanLine(fen: string, pv: string[], limit: number): string[] {
  const chess = new Chess(fen);
  const notes: string[] = [];
  for (const uci of pv.slice(0, limit)) {
    const played = chess.move(uciToMove(uci));
    if (!played) break;
    notes.push(played.san);
  }
  return notes;
}

export function sacrificeInfo(
  fen: string,
  move: Move,
): { kind: SacrificeKind; material: number; piece: SacrificedPiece } {
  const chess = new Chess(fen);
  const played = chess.move({ from: move.from, to: move.to, promotion: move.promotion });
  if (!played || move.piece === "k") return { kind: "none", material: 0, piece: null };
  const opponent = chess.turn();
  const attacked = chess.isAttacked(move.to, opponent);
  const defended = chess.isAttacked(move.to, move.color);
  if (!attacked || defended) return { kind: "none", material: 0, piece: null };
  if (move.piece === "p") {
    if (move.captured) return { kind: "none", material: 0, piece: null };
    return { kind: "pawn", material: 1, piece: "p" };
  }
  const captured = move.captured ? VALUE[move.captured] : 0;
  const material = VALUE[move.piece] - captured;
  if (material < 2) return { kind: "none", material: 0, piece: null };
  return { kind: "piece", material, piece: move.piece };
}

export function capturesFreePiece(fen: string, uci: string): boolean {
  const { from, to, promotion } = uciToMove(uci);
  const chess = new Chess(fen);
  const victim = chess.get(to as Square);
  const mover = chess.get(from as Square);
  if (!victim || !mover || victim.type === "p" || victim.type === "k") return false;
  if (chess.isAttacked(to as Square, victim.color)) return false;
  const played = chess.move({ from, to, promotion });
  return Boolean(played?.captured);
}

export function hungQueen(fen: string, move: Move): boolean {
  const chess = new Chess(fen);
  if (!chess.move({ from: move.from, to: move.to, promotion: move.promotion })) return false;
  const squares = chess.board().flatMap((rank, rankIndex) =>
    rank.flatMap((piece, fileIndex) => {
      if (!piece || piece.color !== move.color || piece.type !== "q") return [];
      const file = "abcdefgh"[fileIndex];
      return [`${file}${8 - rankIndex}`];
    }),
  );
  return squares.some(
    (square) =>
      chess.isAttacked(square as Square, move.color === "w" ? "b" : "w") &&
      !chess.isAttacked(square as Square, move.color),
  );
}

function whiteFromLine(line: EngineLine, turn: "w" | "b"): WhiteEval {
  return toWhiteEval(line.score, turn);
}

function whiteAfterPlayed(afterSearch: EngineSearch, turnAfter: "w" | "b"): WhiteEval | null {
  if (!afterSearch.best) return null;
  return toWhiteEval(afterSearch.best.score, turnAfter);
}

function playerGapCp(best: WhiteEval, second: WhiteEval, color: "w" | "b"): number | null {
  const a = toPlayerEval(best, color);
  const b = toPlayerEval(second, color);
  if (a.kind === "mate" && a.mate > 0) return b.kind === "mate" && b.mate > 0 ? 0 : 400;
  if (a.kind !== "cp" || b.kind !== "cp") return null;
  return a.cp - b.cp;
}

export function isForcedRecapture(previous: Move | null, move: Move, legal: number): boolean {
  if (!previous?.captured || !move.captured) return false;
  if (move.to !== previous.to) return false;
  if (legal === 1) return true;
  return VALUE[move.piece] <= VALUE[move.captured];
}

function matchingLine(root: EngineSearch, uci: string): EngineLine | null {
  return root.lines.find((line) => line.move === uci) ?? null;
}

export type ReviewPlayers = { whiteRating: number | null; blackRating: number | null };

const UNRATED: ReviewPlayers = { whiteRating: null, blackRating: null };

function needsSecondPass(move: MoveReview): boolean {
  const kind = move.classification;
  if (kind === "brilliant" || kind === "great" || kind === "miss" || kind === "blunder") return true;
  if (move.features.sacrificeCandidate.isSacrificeCandidate || move.features.sacrifice !== "none") return true;
  if (move.features.playerBefore.kind === "mate" || move.features.playerAfter.kind === "mate") return true;
  return move.winChanceLoss >= reviewConfig.inaccuracyThreshold;
}

async function reviewMoveAt(
  moves: Move[],
  index: number,
  engine: ReviewEngine,
  options: { depth: number; multiPv: number },
  bookMarks: string,
  players: ReviewPlayers,
  isCancelled: () => boolean,
): Promise<MoveReview | null> {
  const chess = new Chess();
  for (let cursor = 0; cursor < index; cursor += 1) chess.move(moves[cursor]);
  const move = moves[index];
  const fen = chess.fen();
  const turn = chess.turn();
  const legal = chess.moves().length;
  const previous = index > 0 ? moves[index - 1] : null;
  const root = await engine.search(fen, options);
  if (isCancelled() || !root.best) return null;

  const uci = move.from + move.to + (move.promotion ?? "");
  const playedLine = matchingLine(root, uci);
  const playedIsBest = root.best.move === uci;
  const beforeWhite = whiteFromLine(root.best, turn);
  let afterWhite: WhiteEval = beforeWhite;
  let continuation = playedLine?.pv?.length ? playedLine.pv : [uci];
  if (!playedLine) {
    const next = new Chess(fen);
    next.move({ from: move.from, to: move.to, promotion: move.promotion });
    const child = await engine.search(next.fen(), { depth: options.depth, multiPv: 1 });
    const converted = whiteAfterPlayed(child, next.turn());
    if (converted) afterWhite = converted;
    continuation = [uci, ...(child.best?.pv ?? [])];
  }
  if (continuation[0] !== uci) continuation = [uci, ...continuation];

  const rating = turn === "w" ? players.whiteRating : players.blackRating;
  const brilliantBand = getBrilliantThresholds(rating);
  const sacrifice = sacrificeInfo(fen, move);
  const sacrificeCandidate = detectSacrificeCandidate({
    fenBefore: fen,
    pvUci: continuation,
    playerColor: turn,
    minimumMaterial: brilliantBand.minimumMaterial,
    horizon: brilliantBand.horizon,
  });
  const playerBefore = toPlayerEval(beforeWhite, turn);
  const playerAfter = toPlayerEval(afterWhite, turn);
  const chanceBefore = playerExpectedScore(playerBefore, rating);
  const chanceAfter = playerExpectedScore(playerAfter, rating);
  const loss = winChanceLoss(chanceBefore, chanceAfter);
  const secondWhite = root.second ? whiteFromLine(root.second, turn) : null;
  const secondPlayer = secondWhite ? toPlayerEval(secondWhite, turn) : null;
  const secondChance = secondPlayer ? playerExpectedScore(secondPlayer, rating) : null;
  const bestUci = root.best.move;
  const rankIndex = root.lines.findIndex((line) => line.move === uci);
  const offeredPiece = pieceLetter(sacrificeCandidate.sacrificedPiece) ?? sacrifice.piece;
  const features: MoveFeatures = {
    playedIsBest,
    centipawnLoss: centipawnLoss(playerBefore, playerAfter),
    playerBefore,
    playerAfter,
    winChanceBefore: chanceBefore,
    winChanceAfter: chanceAfter,
    winChanceLoss: loss,
    secondWinChance: secondChance,
    alternativeGapCp: secondWhite ? playerGapCp(beforeWhite, secondWhite, turn) : null,
    legalMoves: legal,
    sacrifice: sacrifice.kind,
    materialGiven: sacrifice.material,
    sacrificedPiece: offeredPiece,
    forcedRecapture: isForcedRecapture(previous, move, legal),
    bestCapturesFreePiece: !playedIsBest && capturesFreePiece(fen, bestUci),
    bestSan: sanFor(fen, bestUci),
    hungQueen: hungQueen(fen, move),
    onlyLegalMove: legal === 1,
    book: bookMarks[index] === "K" || isBookMove(moves.slice(0, index).map((earlier) => earlier.san), move.san),
    earlyPosition: index < reviewConfig.openingPlies,
    sacrificeCandidate,
    engineRank: rankIndex >= 0 ? rankIndex + 1 : null,
    playerRating: rating,
  };
  const classification = classifyMove(features);
  const verdict = brilliantVerdict(features);
  const tactical =
    features.playerBefore.kind === "mate" ||
    features.bestCapturesFreePiece ||
    features.sacrifice !== "none" ||
    (secondChance != null && chanceBefore - secondChance >= reviewConfig.greatMoveMultiPVGap);
  const weight = positionImportance({
    winChanceBefore: chanceBefore,
    secondWinChance: secondChance,
    onlyLegalMove: features.onlyLegalMove,
    tactical,
  });
  return {
    ply: index + 1,
    moveNumber: Math.floor(index / 2) + 1,
    color: turn === "w" ? "white" : "black",
    san: move.san,
    uci,
    classification,
    evaluationBefore: beforeWhite,
    evaluationAfter: afterWhite,
    centipawnLoss: features.centipawnLoss,
    winChanceBefore: chanceBefore,
    winChanceAfter: chanceAfter,
    winChanceLoss: loss,
    moveAccuracy: moveAccuracyFromLoss(loss),
    moveWeight: weight,
    bestMove: features.bestSan,
    bestUci,
    bestLine: sanLine(fen, root.best.pv.length > 0 ? root.best.pv : [bestUci], reviewConfig.bestLinePlies),
    variation: root.lines.slice(0, reviewConfig.multiPv).map((line) => ({
      san: sanFor(fen, line.move),
      evaluation: formatWhiteEval(whiteFromLine(line, turn)),
    })),
    brilliant: verdict,
    from: move.from,
    to: move.to,
    features,
  };
}

export async function analyzeGame(
  moves: Move[],
  engine: ReviewEngine,
  onProgress: (done: number, total: number, move: MoveReview | null, replace?: boolean) => void,
  isCancelled: () => boolean,
  bookMarks = "",
  players: ReviewPlayers = UNRATED,
): Promise<GameReview> {
  const reviewed: MoveReview[] = [];
  onProgress(0, moves.length, null);

  for (let index = 0; index < moves.length; index += 1) {
    if (isCancelled()) break;
    const review = await reviewMoveAt(
      moves,
      index,
      engine,
      { depth: reviewConfig.firstPassDepth, multiPv: reviewConfig.firstPassMultiPv },
      bookMarks,
      players,
      isCancelled,
    );
    if (isCancelled() || !review) break;
    reviewed.push(review);
    onProgress(index + 1, moves.length, review, false);
  }

  const candidates = reviewed.filter(needsSecondPass);
  const total = moves.length + candidates.length;
  let refined = 0;
  for (const candidate of candidates) {
    if (isCancelled()) break;
    const again = await reviewMoveAt(
      moves,
      candidate.ply - 1,
      engine,
      { depth: reviewConfig.secondPassDepth, multiPv: reviewConfig.multiPv },
      bookMarks,
      players,
      isCancelled,
    );
    refined += 1;
    if (isCancelled() || !again) break;
    const slot = reviewed.findIndex((move) => move.ply === again.ply);
    if (slot >= 0) reviewed[slot] = again;
    onProgress(moves.length + refined, total, again, true);
  }

  const white = emptySummary();
  const black = emptySummary();
  for (const move of reviewed) {
    const bucket = move.color === "white" ? white : black;
    bucket[move.classification] += 1;
  }
  const score = (color: MoveReview["color"]) =>
    overallAccuracy(reviewed.filter((move) => move.color === color));
  return {
    moves: reviewed,
    white,
    black,
    whiteAccuracy: score("white"),
    blackAccuracy: score("black"),
  };
}

export function summaryOrder(): Classification[] {
  return CLASSIFICATIONS;
}
