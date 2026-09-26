export type ReviewColor = "white" | "black";

export type Classification =
  | "brilliant"
  | "great"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "miss"
  | "blunder";

/** Engine score from White's point of view. Mate > 0 means White forces mate. */
export type WhiteEval = { kind: "cp"; pawns: number } | { kind: "mate"; mate: number };

/** Engine score from the side that just moved. Mate > 0 means that side forces mate. */
export type PlayerEval = { kind: "cp"; cp: number } | { kind: "mate"; mate: number };

export type SacrificeKind = "none" | "pawn" | "piece";

export type SacrificedPiece = "p" | "n" | "b" | "r" | "q" | null;

export type SacrificeType = "direct" | "offered-piece" | "exchange" | "deflection" | "temporary" | "none";

export type CompensationType = "material" | "attack" | "mate" | "queen-win" | "positional" | "none";

export type SacrificeCandidate = {
  isSacrificeCandidate: boolean;
  type: SacrificeType;
  sacrificedPiece: string | null;
  materialValue: number;
  compensationFound: boolean;
  compensationType: CompensationType;
  forcedSequence: string[];
  materialBefore: number;
  materialImmediatelyAfter: number;
};

export type BrilliantGenerosity = "very-generous" | "generous" | "moderate" | "strict" | "very-strict";

export type BrilliantThresholds = {
  nearBestLoss: number;
  minimumMaterial: number;
  minimumExpectedAfter: number;
  trivialExpectedBefore: number;
  trivialAlternative: number;
  horizon: number;
  generosity: BrilliantGenerosity;
};

export type BrilliantVerdict = {
  accepted: boolean;
  nearBest: boolean;
  alreadyWinning: boolean;
  reason: string;
  thresholds: BrilliantThresholds;
};

export type MoveFeatures = {
  playedIsBest: boolean;
  centipawnLoss: number | null;
  playerBefore: PlayerEval;
  playerAfter: PlayerEval;
  /** Expected score of the best move, from the mover. */
  winChanceBefore: number;
  /** Expected score of the played move, from the mover. */
  winChanceAfter: number;
  /** How many expected-score points the played move gave away. 0.11 = 11 points. */
  winChanceLoss: number;
  /** Expected score of the second-best line, from the mover. */
  secondWinChance: number | null;
  alternativeGapCp: number | null;
  legalMoves: number;
  sacrifice: SacrificeKind;
  /** Net material left hanging, in pawn units. */
  materialGiven: number;
  sacrificedPiece: SacrificedPiece;
  forcedRecapture: boolean;
  bestCapturesFreePiece: boolean;
  bestSan: string;
  hungQueen: boolean;
  onlyLegalMove: boolean;
  book: boolean;
  earlyPosition: boolean;
  sacrificeCandidate: SacrificeCandidate;
  /** 1 is the engine's first line. Null means the move was not in the searched lines. */
  engineRank: number | null;
  playerRating: number | null;
};

export type EngineVariation = {
  san: string;
  evaluation: string;
};

export type MoveReview = {
  ply: number;
  moveNumber: number;
  color: ReviewColor;
  san: string;
  uci: string;
  classification: Classification;
  evaluationBefore: WhiteEval;
  evaluationAfter: WhiteEval;
  centipawnLoss: number | null;
  winChanceBefore: number;
  winChanceAfter: number;
  winChanceLoss: number;
  moveAccuracy: number;
  moveWeight: number;
  bestMove: string;
  bestUci: string;
  /** Short engine continuation, including the best first move. */
  bestLine: string[];
  variation: EngineVariation[];
  brilliant: BrilliantVerdict;
  from: string;
  to: string;
  features: MoveFeatures;
};

export type ReviewSummary = Record<Classification, number>;

export type GameReview = {
  moves: MoveReview[];
  white: ReviewSummary;
  black: ReviewSummary;
  whiteAccuracy: number;
  blackAccuracy: number;
};

export const CLASSIFICATIONS: Classification[] = [
  "brilliant",
  "great",
  "best",
  "excellent",
  "good",
  "inaccuracy",
  "mistake",
  "miss",
  "blunder",
];

export const CLASS_MARK: Record<Classification, string> = {
  brilliant: "R",
  great: "G",
  best: "S",
  excellent: "E",
  good: "C",
  inaccuracy: "I",
  mistake: "M",
  miss: "X",
  blunder: "B",
};
