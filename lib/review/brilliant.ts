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

function isNetGift(chess: Chess, square: Square, pieceType: CountedPiece, opponent: "w" | "b"): boolean {
  const captures = chess
    .moves({ verbose: true })
    .filter((move) => move.to === square && move.captured === pieceType && move.color === opponent);
  return captures.some((capture) => {
    const trial = new Chess(chess.fen());
    if (!trial.move(capture)) return false;
    const recaptures = trial.moves({ verbose: true }).filter((move) => move.to === square && move.captured);
    if (recaptures.length === 0) return true;
    const gained = Math.max(...recaptures.map((move) => VALUE[move.captured ?? "p"]));
    return VALUE[pieceType] > gained;
  });
}

/**
 * A sacrifice is the piece this move places where the opponent takes it, before that same piece moves again.
 * It can also be another piece the opponent can take at once, when the piece just moved then pins a more
 * valuable piece and the pin wins material. A pawn move, or leaving a piece that was already lost, is not a sacrifice.
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
  const moverSquare = first.from as Square;
  const alreadyLost =
    chess.get(moverSquare)?.type !== "k" &&
    chess.isAttacked(moverSquare, opponent) &&
    !chess.isAttacked(moverSquare, input.playerColor);
  let played;
  try {
    played = chess.move(first);
  } catch {
    played = null;
  }
  if (!played || played.piece === "p" || alreadyLost) return { ...empty, materialBefore };
  const materialImmediatelyAfter = materialTotal(chess, input.playerColor);
  const afterMove = chess.fen();
  const sequence = [played.san];
  const horizon = Math.max(1, input.horizon);
  const followedSquare: string = played.to;
  const offeredSquare = chess.isAttacked(played.to, opponent) ? played.to : "";
  const offered = offerPinnedPiece(
    afterMove,
    played.to as Square,
    played.san,
    input.playerColor,
    opponent,
    materialBefore - opponentBefore,
    input.minimumMaterial,
    materialBefore,
    materialImmediatelyAfter,
  );

  let taken: { value: number; type: CountedPiece; byKing: boolean; weCapturedFirst: boolean; ply: number; immediate: boolean } | null = null;
  let equalTradeSquare: string | null = null;
  let equalTradeBack = false;
  let leftSquare = false;
  let forcing = played.san.includes("+") || played.san.includes("#") || played.captured != null;
  const weCapturedFirst = played.captured != null;
  const limit = Math.min(horizon, input.pvUci.length);
  for (let ply = 1; ply < limit; ply += 1) {
    const step = uciParts(input.pvUci[ply] ?? "");
    if (!step) break;
    const mover = chess.get(step.from as Square);
    const movingOurs = mover?.color === input.playerColor;
    if (movingOurs && step.from === followedSquare) leftSquare = true;
    let next;
    try {
      next = chess.move(step);
    } catch {
      next = null;
    }
    if (!next) break;
    sequence.push(next.san);
    // Later quiet moves do not undo a capture that already happened on this line.
    if (!taken && movingOurs && !next.captured && !next.san.includes("+") && !next.san.includes("#")) forcing = false;
    const capturesMovedPiece =
      !leftSquare && next.captured != null && next.color !== input.playerColor && next.to === followedSquare;
    if (!taken && capturesMovedPiece && next.captured && next.captured !== "k" && next.captured !== "p") {
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
          immediate: next.to === offeredSquare,
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
    return offered ?? { ...empty, forcedSequence: sequence, materialBefore, materialImmediatelyAfter };
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

function squareName(file: number, rank: number): Square {
  return `${"abcdefgh"[file]}${rank}` as Square;
}

function pieceCount(chess: Chess, color: "w" | "b", type: CountedPiece): number {
  let count = 0;
  for (const rank of chess.board()) {
    for (const piece of rank) {
      if (piece?.color === color && piece.type === type) count += 1;
    }
  }
  return count;
}

function ray(from: Square, to: Square): Square[] | null {
  const fileDelta = to.charCodeAt(0) - from.charCodeAt(0);
  const rankDelta = Number(to[1]) - Number(from[1]);
  const stepFile = Math.sign(fileDelta);
  const stepRank = Math.sign(rankDelta);
  if (stepFile === 0 && stepRank === 0) return null;
  if (stepFile !== 0 && stepRank !== 0 && Math.abs(fileDelta) !== Math.abs(rankDelta)) return null;
  const squares: Square[] = [];
  let file = from.charCodeAt(0) + stepFile;
  let rank = Number(from[1]) + stepRank;
  while (file !== to.charCodeAt(0) || rank !== Number(to[1])) {
    if (file < 97 || file > 104 || rank < 1 || rank > 8) return null;
    squares.push(squareName(file - 97, rank));
    file += stepFile;
    rank += stepRank;
    if (squares.length > 6) return null;
  }
  return squares;
}

/** After the opponent takes the offered piece, the moved piece pins something more valuable and every defense still wins material. */
function offerPinnedPiece(
  fenAfter: string,
  movedTo: Square,
  playedSan: string,
  playerColor: "w" | "b",
  opponent: "w" | "b",
  balanceBefore: number,
  minimumMaterial: number,
  materialBefore: number,
  materialImmediatelyAfter: number,
): SacrificeCandidate | null {
  const chess = new Chess(fenAfter);
  const captures = chess
    .moves({ verbose: true })
    .filter(
      (move) =>
        move.captured &&
        move.captured !== "p" &&
        move.captured !== "k" &&
        move.to !== movedTo &&
        VALUE[move.captured] >= minimumMaterial &&
        isNetGift(chess, move.to, move.captured, opponent),
    );
  let best: { value: number; type: CountedPiece; sequence: string[]; queen: boolean } | null = null;
  for (const capture of captures) {
    const taken = new Chess(fenAfter);
    const captured = taken.move(capture);
    if (!captured?.captured || captured.captured === "p" || captured.captured === "k") continue;
    const offeredType = captured.captured;
    const pins = taken.moves({ verbose: true }).filter((move) => move.from === movedTo);
    for (const pin of pins) {
      const afterPin = new Chess(taken.fen());
      const pinning = afterPin.move(pin);
      if (!pinning) continue;
      const diagonal = pin.from.charCodeAt(0) !== pin.to.charCodeAt(0) && pin.from[1] !== pin.to[1];
      if (diagonal && pinning.piece !== "b" && pinning.piece !== "q") continue;
      if (!diagonal && pinning.piece !== "r" && pinning.piece !== "q") continue;
      const king = kingSquare(afterPin, opponent);
      if (!king) continue;
      const between = ray(pin.to, king);
      if (!between) continue;
      const victim = between.find((square) => afterPin.get(square)?.color === opponent);
      if (!victim || between.some((square) => square !== victim && afterPin.get(square))) continue;
      const pinned = afterPin.get(victim);
      if (!pinned || pinned.type === "p" || pinned.type === "k" || VALUE[pinned.type] <= VALUE[offeredType]) continue;
      const escapes = afterPin
        .moves({ square: victim, verbose: true })
        .filter((move) => move.to !== pin.to && !between.includes(move.to));
      if (escapes.length > 0) continue;
      const beforeCount = pieceCount(afterPin, opponent, pinned.type);
      let worst = 99;
      let wonPiece = false;
      for (const reply of afterPin.moves({ verbose: true })) {
        const next = new Chess(afterPin.fen());
        next.move(reply);
        const answers = next.moves({ verbose: true });
        let bestBalance = answers.length === 0 ? material(next, playerColor) - material(next, opponent) : -99;
        let bestBoard: Chess | null = answers.length === 0 ? next : null;
        for (const answer of answers) {
          const end = new Chess(next.fen());
          end.move(answer);
          const balance = material(end, playerColor) - material(end, opponent);
          if (balance > bestBalance) {
            bestBalance = balance;
            bestBoard = end;
          }
        }
        const capturedPiece = bestBoard != null && pieceCount(bestBoard, opponent, pinned.type) < beforeCount;
        if (bestBalance < worst) {
          worst = bestBalance;
          wonPiece = capturedPiece;
        } else if (bestBalance === worst && !capturedPiece) {
          wonPiece = false;
        }
      }
      if (worst <= balanceBefore || !wonPiece) continue;
      if (!best || VALUE[offeredType] > best.value) {
        best = {
          value: VALUE[offeredType],
          type: offeredType,
          sequence: [playedSan, capture.san, pin.san],
          queen: pinned.type === "q",
        };
      }
    }
  }
  if (!best) return null;
  return {
    isSacrificeCandidate: true,
    type: "offered-piece",
    sacrificedPiece: PIECE_NAME[best.type],
    materialValue: best.value,
    compensationFound: true,
    compensationType: best.queen ? "queen-win" : "material",
    forcedSequence: best.sequence,
    materialBefore,
    materialImmediatelyAfter,
  };
}

function kingSquare(chess: Chess, color: "w" | "b"): Square | null {
  const board = chess.board();
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = board[rank][file];
      if (piece?.type === "k" && piece.color === color) return squareName(file, 8 - rank);
    }
  }
  return null;
}

function material(chess: Chess, color: "w" | "b"): number {
  return materialTotal(chess, color);
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
