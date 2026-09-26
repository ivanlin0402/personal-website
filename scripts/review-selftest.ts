import { readFileSync } from "node:fs";
import { Chess } from "chess.js";
import { analyzeGame, type EngineSearch, type ReviewEngine } from "../lib/review/analyzeGame";
import { detectSacrificeCandidate, noSacrifice } from "../lib/review/brilliant";
import { classifyMove } from "../lib/review/classifyMove";
import {
  centipawnLoss,
  evaluationToWinProbability,
  formatWhiteEval,
  getPlayerPerspectiveEvaluation,
  mateExpectedScore,
  moveAccuracyFromLoss,
  overallAccuracy,
  playerExpectedScore,
  toPlayerEval,
  toWhiteEval,
  winChanceLoss,
} from "../lib/review/evaluation";
import { reviewConfig } from "../lib/review/reviewConfig";
import type { Classification, MoveFeatures } from "../lib/review/reviewTypes";

function features(over: Partial<MoveFeatures> = {}): MoveFeatures {
  const playerBefore = over.playerBefore ?? { kind: "cp" as const, cp: 20 };
  const playerAfter = over.playerAfter ?? playerBefore;
  const winChanceBefore = over.winChanceBefore ?? playerExpectedScore(playerBefore);
  const winChanceAfter = over.winChanceAfter ?? playerExpectedScore(playerAfter);
  const base: MoveFeatures = {
    playedIsBest: false,
    centipawnLoss: 0,
    playerBefore,
    playerAfter,
    winChanceBefore,
    winChanceAfter,
    winChanceLoss: winChanceLoss(winChanceBefore, winChanceAfter),
    secondWinChance: winChanceAfter,
    alternativeGapCp: 0,
    legalMoves: 30,
    sacrifice: "none",
    materialGiven: 0,
    sacrificedPiece: null,
    forcedRecapture: false,
    bestCapturesFreePiece: false,
    bestSan: "Nf3",
    hungQueen: false,
    onlyLegalMove: false,
    book: false,
    earlyPosition: false,
    sacrificeCandidate: noSacrifice(),
    engineRank: null,
    playerRating: null,
  };
  return {
    ...base,
    ...over,
    playerBefore,
    playerAfter,
    winChanceBefore,
    winChanceAfter,
    winChanceLoss: over.winChanceLoss ?? winChanceLoss(winChanceBefore, winChanceAfter),
    secondWinChance: over.secondWinChance === undefined ? winChanceAfter : over.secondWinChance,
  };
}

function expectClass(name: string, input: MoveFeatures, expected: Classification) {
  const actual = classifyMove(input);
  if (actual !== expected) {
    failed += 1;
    console.error(`${name}: expected ${expected}, got ${actual}`);
  }
}

let failed = 0;

expectClass("perfect engine move", features({ playedIsBest: true, winChanceLoss: 0, secondWinChance: 0.5 }), "best");
expectClass(
  "small error",
  features({ winChanceBefore: 0.56, winChanceAfter: 0.52, winChanceLoss: 0.04, secondWinChance: 0.52 }),
  "good",
);
expectClass(
  "equality destroyed",
  features({ winChanceBefore: 0.5, winChanceAfter: 0.18, winChanceLoss: 0.32, secondWinChance: 0.46 }),
  "blunder",
);
expectClass(
  "winning position slightly reduced",
  features({ winChanceBefore: 0.99, winChanceAfter: 0.96, winChanceLoss: 0.03, secondWinChance: 0.96 }),
  "good",
);
expectClass(
  "lost position worsened",
  features({ winChanceBefore: 0.03, winChanceAfter: 0.01, winChanceLoss: 0.02, secondWinChance: 0.02 }),
  "excellent",
);
expectClass(
  "missed mate",
  features({
    playerBefore: { kind: "mate", mate: 3 },
    playerAfter: { kind: "cp", cp: 100 },
    winChanceBefore: 0.99,
    winChanceAfter: 0.62,
    winChanceLoss: 0.37,
    secondWinChance: 0.62,
  }),
  "miss",
);
expectClass(
  "allows mate",
  features({
    playerBefore: { kind: "cp", cp: 20 },
    playerAfter: { kind: "mate", mate: -3 },
    winChanceBefore: 0.53,
    winChanceAfter: 0.01,
    winChanceLoss: 0.52,
    secondWinChance: 0.5,
  }),
  "blunder",
);
expectClass(
  "great move keeps equality",
  features({
    playedIsBest: true,
    winChanceBefore: 0.52,
    winChanceAfter: 0.52,
    winChanceLoss: 0,
    secondWinChance: 0.28,
    bestSan: "Qg3",
  }),
  "great",
);
expectClass(
  "brilliant rook sacrifice",
  features({
    playedIsBest: true,
    sacrifice: "piece",
    materialGiven: 5,
    sacrificedPiece: "r",
    winChanceBefore: 0.74,
    winChanceAfter: 0.74,
    winChanceLoss: 0,
    secondWinChance: 0.4,
    engineRank: 1,
    playerRating: 1059,
    sacrificeCandidate: {
      isSacrificeCandidate: true,
      type: "temporary",
      sacrificedPiece: "rook",
      materialValue: 5,
      compensationFound: true,
      compensationType: "queen-win",
      forcedSequence: ["Rxh3", "Qxh3", "Qxf6+", "Rg7", "Qxg7+", "Kxg7", "gxh3"],
      materialBefore: 32,
      materialImmediatelyAfter: 35,
    },
  }),
  "brilliant",
);
expectClass(
  "inaccurate sacrifice is not brilliant",
  features({
    engineRank: 4,
    playerRating: 1059,
    winChanceBefore: 0.7,
    winChanceAfter: 0.56,
    winChanceLoss: 0.14,
    secondWinChance: 0.68,
    sacrificeCandidate: {
      isSacrificeCandidate: true,
      type: "direct",
      sacrificedPiece: "rook",
      materialValue: 5,
      compensationFound: true,
      compensationType: "material",
      forcedSequence: ["Rxh3", "Qxh3"],
      materialBefore: 32,
      materialImmediatelyAfter: 30,
    },
  }),
  "mistake",
);
expectClass(
  "already-winning sacrifice is not brilliant",
  features({
    playedIsBest: true,
    playerRating: 1059,
    winChanceBefore: 0.99,
    winChanceAfter: 0.99,
    winChanceLoss: 0,
    secondWinChance: 0.97,
    sacrificeCandidate: {
      isSacrificeCandidate: true,
      type: "direct",
      sacrificedPiece: "knight",
      materialValue: 3,
      compensationFound: true,
      compensationType: "material",
      forcedSequence: ["Nxf7+", "Kxf7"],
      materialBefore: 39,
      materialImmediatelyAfter: 36,
    },
  }),
  "best",
);
expectClass(
  "losing sacrifice is not brilliant",
  features({
    playedIsBest: true,
    sacrifice: "piece",
    materialGiven: 5,
    sacrificedPiece: "r",
    winChanceBefore: 0.3,
    winChanceAfter: 0.2,
    winChanceLoss: 0,
    secondWinChance: 0.26,
  }),
  "best",
);
expectClass(
  "forced recapture is not great",
  features({
    playedIsBest: true,
    forcedRecapture: true,
    winChanceLoss: 0,
    secondWinChance: 0.1,
  }),
  "best",
);
expectClass(
  "only legal move is not brilliant",
  features({
    onlyLegalMove: true,
    sacrifice: "piece",
    materialGiven: 9,
    sacrificedPiece: "q",
    secondWinChance: 0.1,
  }),
  "best",
);
expectClass(
  "missed free piece that stays near the alternative",
  features({
    bestCapturesFreePiece: true,
    winChanceBefore: 0.9,
    winChanceAfter: 0.5,
    winChanceLoss: 0.4,
    secondWinChance: 0.5,
  }),
  "miss",
);
expectClass(
  "throwing a playable position is a blunder even if a tactic existed",
  features({
    bestCapturesFreePiece: true,
    hungQueen: true,
    winChanceBefore: 0.55,
    winChanceAfter: 0.08,
    winChanceLoss: 0.47,
    secondWinChance: 0.5,
  }),
  "blunder",
);
expectClass(
  "book move with a small engine disagreement stays good",
  features({
    book: true,
    winChanceBefore: 0.52,
    winChanceAfter: 0.44,
    winChanceLoss: 0.08,
    secondWinChance: 0.49,
  }),
  "good",
);
expectClass(
  "routine opening gap is not great",
  features({
    playedIsBest: true,
    earlyPosition: true,
    winChanceLoss: 0,
    winChanceBefore: 0.52,
    winChanceAfter: 0.52,
    secondWinChance: 0.38,
  }),
  "best",
);

const equal = evaluationToWinProbability(0);
const plusHalf = evaluationToWinProbability(50);
const plusOne = evaluationToWinProbability(100);
const plusTwo = evaluationToWinProbability(200);
const plusFour = evaluationToWinProbability(400);
const plusEight = evaluationToWinProbability(800);
if (!(equal > 0.48 && equal < 0.52)) {
  failed += 1;
  console.error("zero should be about 50%", equal);
}
if (!(plusHalf > equal && plusHalf < plusOne && plusOne < 0.7)) {
  failed += 1;
  console.error("small and meaningful advantages", plusHalf, plusOne);
}
if (!(plusTwo > 0.7 && plusTwo < plusFour && plusFour > 0.85 && plusFour < 0.96)) {
  failed += 1;
  console.error("strong and usually winning", plusTwo, plusFour);
}
if (!(plusEight > 0.97)) {
  failed += 1;
  console.error("overwhelming", plusEight);
}

const swing = winChanceLoss(playerExpectedScore({ kind: "cp", cp: 20 }), playerExpectedScore({ kind: "cp", cp: -180 }));
const decided = winChanceLoss(playerExpectedScore({ kind: "cp", cp: 800 }), playerExpectedScore({ kind: "cp", cp: 600 }));
if (!(swing > decided * 3)) {
  failed += 1;
  console.error("equal swing should dwarf a winning cushion", swing, decided);
}
if (!(moveAccuracyFromLoss(0) >= 99.9)) {
  failed += 1;
  console.error("perfect accuracy");
}
if (!(moveAccuracyFromLoss(0.02) > 97 && moveAccuracyFromLoss(decided) > 95)) {
  failed += 1;
  console.error("small expected-score losses stay high", moveAccuracyFromLoss(0.02), moveAccuracyFromLoss(decided));
}
if (!(moveAccuracyFromLoss(swing) < 70 && moveAccuracyFromLoss(0.3) < moveAccuracyFromLoss(0.05))) {
  failed += 1;
  console.error("large swings should score much lower", moveAccuracyFromLoss(swing));
}

const blackBefore = getPlayerPerspectiveEvaluation({ kind: "cp", pawns: 0 }, "b");
const blackAfter = getPlayerPerspectiveEvaluation({ kind: "cp", pawns: -1 }, "b");
if (!(playerExpectedScore(blackAfter) > playerExpectedScore(blackBefore))) {
  failed += 1;
  console.error("black should gain when the white evaluation falls", blackBefore, blackAfter);
}

const weighted = overallAccuracy([
  { moveAccuracy: 100, moveWeight: 1.2 },
  { moveAccuracy: 0, moveWeight: reviewConfig.minMoveWeight },
]);
if (!(weighted > 70 && weighted < 90)) {
  failed += 1;
  console.error("weighted accuracy should not be a plain average", weighted);
}

const whiteMate = toWhiteEval({ type: "mate", mate: 3 }, "b");
if (whiteMate.kind !== "mate" || whiteMate.mate !== -3) {
  failed += 1;
  console.error("black mate should be negative for white", whiteMate);
}
const player = toPlayerEval({ kind: "cp", pawns: 1.2 }, "b");
if (player.kind !== "cp" || player.cp !== -120) {
  failed += 1;
  console.error("black player cp", player);
}
const loss = centipawnLoss({ kind: "cp", cp: 20 }, { kind: "cp", cp: -200 });
if (loss !== 220) {
  failed += 1;
  console.error("cpl", loss);
}
const mateLoss = centipawnLoss({ kind: "mate", mate: 2 }, { kind: "cp", cp: 0 });
if (mateLoss !== null) {
  failed += 1;
  console.error("mate should not become centipawns", mateLoss);
}
if (!(mateExpectedScore(3) > 0.95 && mateExpectedScore(-3) < 0.05)) {
  failed += 1;
  console.error("mate expected score", mateExpectedScore(3), mateExpectedScore(-3));
}
if (formatWhiteEval({ kind: "mate", mate: -2 }) !== "-M2") {
  failed += 1;
  console.error("format mate");
}
if (formatWhiteEval({ kind: "cp", pawns: 1.24 }) !== "+1.2") {
  failed += 1;
  console.error("format cp");
}

const fixturePgn = readFileSync("scripts/fixtures/tzya-brilliant.pgn", "utf8");

function continuationFrom(pgn: string, san: string, plies: number): { fen: string; pv: string[]; color: "w" | "b" } | null {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });
  const index = history.findIndex((move) => move.san === san);
  if (index < 0) return null;
  const board = new Chess();
  for (let cursor = 0; cursor < index; cursor += 1) board.move(history[cursor].san);
  return {
    fen: board.fen(),
    color: history[index].color,
    pv: history.slice(index, index + plies).map((move) => move.from + move.to + (move.promotion ?? "")),
  };
}

for (const [san, piece] of [
  ["Rxh3", "rook"],
  ["Qxf6+", "queen"],
  ["Qxg7+", "queen"],
] as const) {
  const line = continuationFrom(fixturePgn, san, 8);
  const found = line
    ? detectSacrificeCandidate({
        fenBefore: line.fen,
        pvUci: line.pv,
        playerColor: line.color,
        minimumMaterial: 2,
        horizon: 8,
      })
    : noSacrifice();
  if (!found.isSacrificeCandidate || found.sacrificedPiece !== piece || !found.compensationFound) {
    failed += 1;
    console.error(`${san} should be a compensated ${piece} sacrifice`, found);
  }
}
if (continuationFrom(fixturePgn, "Qxg7+", 8)?.color === "w") {
  const line = continuationFrom(fixturePgn, "Qxg7+", 4);
  const found = line
    ? detectSacrificeCandidate({
        fenBefore: line.fen,
        pvUci: line.pv,
        playerColor: line.color,
        minimumMaterial: 2,
        horizon: 8,
      })
    : noSacrifice();
  if (found.type !== "deflection") {
    failed += 1;
    console.error("queen offer taken by the king should be a deflection", found.type);
  }
}
const quiet = continuationFrom(fixturePgn, "e4", 4);
const opening = quiet
  ? detectSacrificeCandidate({
      fenBefore: quiet.fen,
      pvUci: quiet.pv,
      playerColor: quiet.color,
      minimumMaterial: 2,
      horizon: 8,
    })
  : noSacrifice();
if (opening.isSacrificeCandidate) {
  failed += 1;
  console.error("the opening pawn move is not a sacrifice", opening);
}
const knightForRook = continuationFrom(fixturePgn, "Ne8+", 6);
const winningCapture = knightForRook
  ? detectSacrificeCandidate({
      fenBefore: knightForRook.fen,
      pvUci: knightForRook.pv,
      playerColor: knightForRook.color,
      minimumMaterial: 2,
      horizon: 8,
    })
  : noSacrifice();
if (winningCapture.isSacrificeCandidate) {
  failed += 1;
  console.error("winning a more valuable piece is not a sacrifice", winningCapture);
}

async function runEngineCase() {
  const chess = new Chess();
  chess.loadPgn("1. e4 e5");
const depths: number[] = [];
const multi: number[] = [];
const engine: ReviewEngine = {
  async search(fen, options): Promise<EngineSearch> {
    depths.push(options?.depth ?? 0);
    multi.push(options?.multiPv ?? 0);
    const blackToMove = fen.includes(" b ");
    if (blackToMove) {
      const line = {
        depth: options?.depth ?? 0,
        multipv: 1,
        score: { type: "cp" as const, cp: 800 },
        move: "e7e5",
        pv: ["e7e5"],
      };
      return { best: line, second: null, third: null, lines: [line] };
    }
    const best = {
      depth: options?.depth ?? 0,
      multipv: 1,
      score: { type: "cp" as const, cp: 30 },
      move: "h2h4",
      pv: ["h2h4", "e7e5"],
    };
    const second = {
      depth: options?.depth ?? 0,
      multipv: 2,
      score: { type: "cp" as const, cp: 10 },
      move: "a2a3",
      pv: ["a2a3"],
    };
    return { best, second, third: null, lines: [best, second] };
  },
};

const reviewed = await analyzeGame(chess.history({ verbose: true }), engine, () => {}, () => false);
if (reviewed.moves.length !== 2) {
  failed += 1;
  console.error("two-pass review length", reviewed.moves.length);
}
if (!depths.includes(reviewConfig.firstPassDepth) || !depths.includes(reviewConfig.secondPassDepth)) {
  failed += 1;
  console.error("two-pass depths", depths);
}
if (!multi.includes(reviewConfig.multiPv)) {
  failed += 1;
  console.error("deeper multipv", multi);
}
if (reviewed.moves[0]?.classification !== "blunder") {
  failed += 1;
  console.error("synthetic collapse", reviewed.moves.map((move) => `${move.san}:${move.classification}`));
}
  if (!(reviewed.whiteAccuracy < 60)) {
    failed += 1;
    console.error("collapsed accuracy", reviewed.whiteAccuracy);
  }
}

runEngineCase().then(() => {
  if (failed) {
    console.error(`FAILED ${failed}`);
    process.exit(1);
  }
  console.log("REVIEW SELFTEST ok");
});
