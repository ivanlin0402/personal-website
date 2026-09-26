import { Chess, type Square } from "chess.js";
import { reviewConfig } from "@/lib/review/reviewConfig";
import type { BrilliantGenerosity, BrilliantThresholds, BrilliantVerdict, CompensationType, MoveFeatures, SacrificedPiece, SacrificeCandidate, SacrificeType } from "@/lib/review/reviewTypes";

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 } as const;

const PIECE_NAME = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
} as const;

type CountedPiece = "p" | "n" | "b" | "r" | "q";

function uciParts(uci: string): { from: string; to: string; promotion?: string } | null {
  if (uci.length < 4) return null;
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] };
}

function materialTotal(chess: Chess, color: "w" | "b"): number {
  let total = 0;
  for (const rank of chess.board()) {
    for (const piece of rank) {
      if (!piece || piece.color !== color || piece.type === "k") continue;
      total += VALUE[piece.type];
    }
  }
  return total;
}

function queenCount(chess: Chess, color: "w" | "b"): number {
  let queens = 0;
  for (const rank of chess.board()) {
    for (const piece of rank) {
      if (piece?.color === color && piece.type === "q") queens += 1;
    }
  }
  return queens;
}

export function noSacrifice(): SacrificeCandidate {
  return {
    isSacrificeCandidate: false,
    type: "none",
    sacrificedPiece: null,
    materialValue: 0,
    compensationFound: false,
    compensationType: "none",
    forcedSequence: [],
    materialBefore: 0,
    materialImmediatelyAfter: 0,
  };
}

/**
 * A sacrifice is a valuable piece this move leaves where the opponent can take it,
 * and the engine line actually takes it. The material does not have to stay gone:
 * winning it back, or winning the queen, is compensation.
 */
export function detectSacrificeCandidate(input: {
  fenBefore: string;
  pvUci: string[];
  playerColor: "w" | "b";
  minimumMaterial: number;
  horizon: number;
}): SacrificeCandidate {
  const empty = noSacrifice();
  const first = uciParts(input.pvUci[0] ?? "");
  if (!first) return empty;
  const chess = new Chess(input.fenBefore);
  const materialBefore = materialTotal(chess, input.playerColor);
  const opponent = input.playerColor === "w" ? "b" : "w";
  const opponentBefore = materialTotal(chess, opponent);
  const queensBefore = queenCount(chess, opponent);
  const played = chess.move(first);
  if (!played) return { ...empty, materialBefore };
  const materialImmediatelyAfter = materialTotal(chess, input.playerColor);
  const sequence = [played.san];
  const horizon = Math.max(1, input.horizon);
  let followedSquare: string = played.to;

  const offered = new Map<string, { value: number; type: CountedPiece }>();
  for (const reply of chess.moves({ verbose: true })) {
    if (!reply.captured || reply.captured === "k") continue;
    const value = VALUE[reply.captured];
    if (value < input.minimumMaterial) continue;
    const previous = offered.get(reply.to);
    if (!previous || value > previous.value) {
      offered.set(reply.to, { value, type: reply.captured });
    }
  }

  let taken: { value: number; type: CountedPiece; byKing: boolean; weCapturedFirst: boolean; ply: number; immediate: boolean } | null = null;
  let equalTradeSquare: string | null = null;
  let equalTradeBack = false;
  let forcing = played.san.includes("+") || played.san.includes("#") || played.captured != null;
  const weCapturedFirst = played.captured != null;
  const limit = Math.min(horizon, input.pvUci.length);
  for (let ply = 1; ply < limit; ply += 1) {
    const step = uciParts(input.pvUci[ply] ?? "");
    if (!step) break;
    const mover = chess.get(step.from as Square);
    const movingOurs = mover?.color === input.playerColor;
    if (movingOurs && step.from === followedSquare) followedSquare = step.to;
    const next = chess.move(step);
    if (!next) break;
    sequence.push(next.san);
    // Later quiet moves do not undo a capture that already happened on this line.
    if (!taken && movingOurs && !next.captured && !next.san.includes("+") && !next.san.includes("#")) forcing = false;
    const capturesFollowed = next.captured != null && next.color !== input.playerColor && next.to === followedSquare;
    const capturesOffer = next.captured != null && next.color !== input.playerColor && offered.has(next.to);
    if (!taken && (capturesFollowed || capturesOffer) && next.captured && next.captured !== "k") {
      const value = VALUE[next.captured];
      const netGiven =
        materialBefore -
        materialTotal(chess, input.playerColor) -
        (opponentBefore - materialTotal(chess, opponent));
      // Capturing a more valuable piece and then losing the attacker is a trade, not a sacrifice.
      if (value >= input.minimumMaterial && netGiven > 0) {
        taken = {
          value,
          type: next.captured,
          byKing: mover?.type === "k",
          weCapturedFirst,
          ply,
          immediate: capturesOffer,
        };
      }
    }
    if (ply === 1 && next.captured && mover && mover.type !== "k" && VALUE[next.captured] === VALUE[mover.type]) {
      equalTradeSquare = next.to;
    }
    if (ply === 2 && equalTradeSquare && next.color === input.playerColor && next.to === equalTradeSquare && next.captured) {
      equalTradeBack = true;
    }
  }

  if (!taken || (equalTradeBack && taken.ply === 1 && !taken.byKing) || (!taken.immediate && !forcing)) {
    return { ...empty, forcedSequence: sequence, materialBefore, materialImmediatelyAfter };
  }

  const ourEnd = materialTotal(chess, input.playerColor);
  const recovered = ourEnd >= materialBefore - 1;
  const queenWon = queenCount(chess, opponent) < queensBefore;
  const mate = chess.isCheckmate() && chess.turn() !== input.playerColor;
  const attack = sequence.slice(1).some((san) => san.includes("+") || san.includes("#"));

  let compensationType: CompensationType = "positional";
  let compensationFound = false;
  if (mate) {
    compensationType = "mate";
    compensationFound = true;
  } else if (queenWon) {
    compensationType = "queen-win";
    compensationFound = true;
  } else if (recovered) {
    compensationType = "material";
    compensationFound = true;
  } else if (attack) {
    compensationType = "attack";
    compensationFound = true;
  }

  let type: SacrificeType = "offered-piece";
  if (taken.byKing && taken.ply === 1) type = "deflection";
  else if (taken.byKing || recovered || queenWon) type = "temporary";
  else if (taken.weCapturedFirst && taken.value - VALUE[played.captured ?? "p"] <= 2) type = "exchange";
  else if (taken.weCapturedFirst) type = "direct";

  return {
    isSacrificeCandidate: true,
    type,
    sacrificedPiece: PIECE_NAME[taken.type],
    materialValue: taken.value,
    compensationFound,
    compensationType,
    forcedSequence: sequence,
    materialBefore,
    materialImmediatelyAfter,
  };
}

/** Lower ratings get a wider near-best window and a lower bar for a sound result. */
export function getBrilliantThresholds(playerRating: number | null): BrilliantThresholds {
  const rating = playerRating ?? 1600;
  const horizon = reviewConfig.brilliantHorizon;
  if (rating < 800) {
    return {
      nearBestLoss: 0.05,
      minimumMaterial: 2,
      minimumExpectedAfter: 0.36,
      trivialExpectedBefore: 0.99,
      trivialAlternative: 0.97,
      horizon,
      generosity: "very-generous",
    };
  }
  if (rating < 1200) {
    return {
      nearBestLoss: 0.03,
      minimumMaterial: 2,
      minimumExpectedAfter: 0.4,
      trivialExpectedBefore: 0.985,
      trivialAlternative: 0.96,
      horizon,
      generosity: "generous",
    };
  }
  if (rating < 1600) {
    return {
      nearBestLoss: 0.02,
      minimumMaterial: 2,
      minimumExpectedAfter: reviewConfig.brilliantMinExpected,
      trivialExpectedBefore: 0.98,
      trivialAlternative: 0.95,
      horizon,
      generosity: "moderate",
    };
  }
  if (rating < 2000) {
    return {
      nearBestLoss: 0.012,
      minimumMaterial: 3,
      minimumExpectedAfter: 0.52,
      trivialExpectedBefore: 0.97,
      trivialAlternative: 0.93,
      horizon: Math.min(horizon, 6),
      generosity: "strict",
    };
  }
  return {
    nearBestLoss: 0.008,
    minimumMaterial: 3,
    minimumExpectedAfter: 0.55,
    trivialExpectedBefore: 0.96,
    trivialAlternative: 0.92,
    horizon: Math.min(horizon, 6),
    generosity: "very-strict",
  };
}

export function pieceLetter(name: string | null): SacrificedPiece {
  if (name === "pawn") return "p";
  if (name === "knight") return "n";
  if (name === "bishop") return "b";
  if (name === "rook") return "r";
  if (name === "queen") return "q";
  return null;
}

export function brilliantVerdict(features: MoveFeatures): BrilliantVerdict {
  const thresholds = getBrilliantThresholds(features.playerRating);
  const candidate = features.sacrificeCandidate;
  const nearBest =
    features.playedIsBest ||
    features.engineRank === 1 ||
    features.winChanceLoss <= thresholds.nearBestLoss;
  const alreadyWinning =
    features.winChanceBefore >= thresholds.trivialExpectedBefore &&
    (features.secondWinChance == null || features.secondWinChance >= thresholds.trivialAlternative);
  const soundMate = features.playerAfter.kind === "mate" && features.playerAfter.mate > 0;
  const sound = soundMate || features.winChanceAfter >= thresholds.minimumExpectedAfter;
  const compensated =
    candidate.compensationFound ||
    soundMate ||
    features.winChanceAfter + 0.015 >= features.winChanceBefore;

  const rank = features.engineRank == null ? "not in the top lines" : `#${features.engineRank}`;
  if (features.onlyLegalMove) {
    return { accepted: false, nearBest, alreadyWinning, thresholds, reason: "This was the only legal move." };
  }
  if (!candidate.isSacrificeCandidate) {
    return {
      accepted: false,
      nearBest,
      alreadyWinning,
      thresholds,
      reason: "No valuable piece is left where the continuation actually takes it.",
    };
  }
  if (features.forcedRecapture) {
    return { accepted: false, nearBest, alreadyWinning, thresholds, reason: "This is a forced recapture." };
  }
  if (!nearBest) {
    return {
      accepted: false,
      nearBest,
      alreadyWinning,
      thresholds,
      reason: `The sacrifice is too inaccurate. Expected Points loss is ${features.winChanceLoss.toFixed(2)} and the engine rank is ${rank}.`,
    };
  }
  if (!sound) {
    return {
      accepted: false,
      nearBest,
      alreadyWinning,
      thresholds,
      reason: "The sacrifice leaves a bad position.",
    };
  }
  if (!compensated) {
    return {
      accepted: false,
      nearBest,
      alreadyWinning,
      thresholds,
      reason: "No compensation was found after the material was offered.",
    };
  }
  if (alreadyWinning) {
    return {
      accepted: false,
      nearBest,
      alreadyWinning,
      thresholds,
      reason: "The position was already completely winning without the sacrifice.",
    };
  }
  const piece = candidate.sacrificedPiece ?? "piece";
  const kind = candidate.type === "none" ? "sacrifice" : `${candidate.type} ${piece} sacrifice`;
  return {
    accepted: true,
    nearBest,
    alreadyWinning,
    thresholds,
    reason: `Sound ${kind}. Compensation: ${candidate.compensationType}.`,
  };
}
