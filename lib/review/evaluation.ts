import { reviewConfig } from "@/lib/review/reviewConfig";
import type { PlayerEval, WhiteEval } from "@/lib/review/reviewTypes";

export type SideScore = { type: "cp"; cp: number } | { type: "mate"; mate: number };

/** Stockfish scores the side to move. Convert that to White's point of view. */
export function toWhiteEval(score: SideScore, turn: "w" | "b"): WhiteEval {
  if (score.type === "mate") {
    const mate = turn === "w" ? score.mate : -score.mate;
    return { kind: "mate", mate };
  }
  const pawns = (turn === "w" ? score.cp : -score.cp) / 100;
  return { kind: "cp", pawns: Math.round(pawns * 100) / 100 };
}

/** Evaluation from the side about to move, or the side that just moved. */
export function getPlayerPerspectiveEvaluation(white: WhiteEval, color: "w" | "b"): PlayerEval {
  if (white.kind === "mate") {
    return { kind: "mate", mate: color === "w" ? white.mate : -white.mate };
  }
  return { kind: "cp", cp: Math.round((color === "w" ? white.pawns : -white.pawns) * 100) };
}

export const toPlayerEval = getPlayerPerspectiveEvaluation;

/**
 * Smooth expected score for a centipawn evaluation, from that side's point of view.
 * 0 is about 50%. Positive scores rise toward 1. This is not a claimed win probability
 * from Chess.com; it is the curve Game Review Accuracy uses.
 */
export function evaluationToWinProbability(cp: number, rating?: number | null): number {
  const capped = Math.max(-4000, Math.min(4000, cp));
  const scale = rating == null ? reviewConfig.winProbabilityScale : ratingWinScale(rating);
  return 1 / (1 + Math.exp(-capped / scale));
}

/**
 * Lower-rated games convert an advantage less reliably, so the same centipawn
 * score becomes a flatter expected result. Around 2000 the scale stays near the default.
 */
export function ratingWinScale(rating: number): number {
  const clamped = Math.max(600, Math.min(2400, rating));
  return Math.round(340 - ((clamped - 600) / 1800) * 190);
}

/** Mate stays a separate state. A short forced mate is near-certain and is never turned into centipawns. */
export function mateExpectedScore(mate: number): number {
  const distance = Math.abs(mate);
  const winning = Math.max(0.9, Math.min(0.997, 1 - distance * 0.004));
  if (mate > 0) return winning;
  if (mate < 0) return 1 - winning;
  return 0;
}

export function playerExpectedScore(evaluation: PlayerEval, rating?: number | null): number {
  if (evaluation.kind === "mate") return mateExpectedScore(evaluation.mate);
  return evaluationToWinProbability(evaluation.cp, rating);
}

/** Expected-score points given away by the mover. Gains are not negative losses. */
export function winChanceLoss(before: number, after: number): number {
  return Math.max(0, before - after);
}

/**
 * Centipawn loss for the player who moved.
 * Returns null when a mate score is involved so mate is not treated as a fake centipawn.
 */
export function centipawnLoss(before: PlayerEval, after: PlayerEval): number | null {
  if (before.kind === "mate" || after.kind === "mate") {
    if (before.kind === "mate" && after.kind === "mate" && before.mate > 0 && after.mate > 0) {
      return 0;
    }
    return null;
  }
  return Math.max(0, before.cp - after.cp);
}

/**
 * One move's accuracy, 0–100. Small expected-score losses barely move it.
 * Large changes in the result drop it sharply. Mate is not passed in as centipawns;
 * callers pass the expected-score loss instead.
 */
export function moveAccuracyFromLoss(loss: number): number {
  const raw = 100 * Math.exp(-reviewConfig.accuracyCurve * loss * loss);
  return Math.round(Math.max(0, Math.min(100, raw)) * 10) / 10;
}

/**
 * Critical positions count more. Equal, tactical, and high-swing positions weigh more
 * than a move in a completely winning or completely lost position. Forced moves stay light.
 */
export function positionImportance(input: {
  winChanceBefore: number;
  secondWinChance: number | null;
  onlyLegalMove: boolean;
  tactical: boolean;
}): number {
  if (input.onlyLegalMove) return reviewConfig.minMoveWeight;
  const balance = 1 - Math.min(1, Math.abs(input.winChanceBefore - 0.5) * 2);
  const gap =
    input.secondWinChance == null ? 0 : Math.min(1, Math.max(0, input.winChanceBefore - input.secondWinChance) / 0.25);
  let importance = 0.4 + balance * 0.75 + gap * 0.5;
  if (input.tactical) importance += 0.25;
  if (input.winChanceBefore > 0.97 || input.winChanceBefore < 0.03) importance *= 0.55;
  return Math.max(reviewConfig.minMoveWeight, Math.min(2, importance));
}

/** Game Review Accuracy: a weighted average, not the mean of centipawn loss. */
export function overallAccuracy(rows: Array<{ moveAccuracy: number; moveWeight: number }>): number {
  if (rows.length === 0) return 0;
  let weighted = 0;
  let weight = 0;
  for (const row of rows) {
    const moveWeight = Math.max(reviewConfig.minMoveWeight, row.moveWeight);
    weighted += row.moveAccuracy * moveWeight;
    weight += moveWeight;
  }
  return Math.round((weighted / weight) * 10) / 10;
}

export function formatWhiteEval(value: WhiteEval): string {
  if (value.kind === "mate") {
    if (value.mate === 0) return "M0";
    return value.mate > 0 ? `M${value.mate}` : `-M${Math.abs(value.mate)}`;
  }
  const rounded = Math.round(value.pawns * 10) / 10;
  if (rounded === 0) return "0.0";
  return rounded > 0 ? `+${rounded.toFixed(1)}` : rounded.toFixed(1);
}

export function formatExpected(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/** Share of the bar that should be White, from an evaluation. */
export function whiteShare(value: WhiteEval): number {
  if (value.kind === "mate") return value.mate > 0 ? 96 : value.mate < 0 ? 4 : 50;
  const clamped = Math.max(-8, Math.min(8, value.pawns));
  return 50 + clamped * 5.5;
}

/** Pawns used by the evaluation graph. Mates sit at the edge and are not converted into a fake material score. */
export function graphPawns(value: WhiteEval): number {
  if (value.kind === "mate") return value.mate > 0 ? 8 : value.mate < 0 ? -8 : 0;
  return Math.max(-8, Math.min(8, value.pawns));
}
