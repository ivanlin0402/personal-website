/**
 * Game Review Accuracy tuning.
 * This is not Chess.com's official algorithm. Change the numbers here;
 * the classifier reads these values and does not hard-code them.
 */
export const reviewConfig = {
  /**
   * Logistic divisor for centipawns → expected score.
   * Higher is a flatter curve. 180 puts +1 around a meaningful advantage,
   * +2 around a strong one, +4 usually winning, and +8 overwhelming.
   */
  winProbabilityScale: 180,

  /** Expected-score loss that still counts as Best. 0 means only a true zero loss, or the engine's top move. */
  bestEquivalent: 0,
  excellentThreshold: 0.02,
  goodThreshold: 0.05,
  inaccuracyThreshold: 0.1,
  mistakeThreshold: 0.2,
  blunderThreshold: 0.2,

  /** Expected-score gap between the best and second-best move required for Great. */
  greatMoveMultiPVGap: 0.1,
  /** Opening moves need a wider gap before they can be Great. */
  greatOpeningGap: 0.22,
  /** Best line this far above the second line is a standout opportunity. */
  missStandout: 0.15,
  /** Played move within this of the second line missed the tactic rather than throwing the game. */
  missNearSecond: 0.06,
  /** Best-move expected score that counts as a real chance to miss. */
  missMinChance: 0.65,
  /** Losing a forced mate this short, or shorter, is a Miss. */
  missMateDistance: 5,

  /** Plies of the engine line used when looking for a multi-move sacrifice. */
  brilliantHorizon: 8,
  /** The position must remain at least this expected score after a Brilliant sacrifice. */
  brilliantMinExpected: 0.48,

  /** Quadratic steepness of per-move accuracy. Small losses stay near 100. */
  accuracyCurve: 22,
  /** Decided or forced positions never fall below this weight. */
  minMoveWeight: 0.25,

  /** The first this many plies can be treated as the opening. */
  openingPlies: 12,
  /** Early engine lines inside this expected-score gap are treated as equivalent. */
  openingEqualGap: 0.04,

  firstPassDepth: 14,
  secondPassDepth: 18,
  /** Pass 1 compares two lines so a full game stays responsive in the browser. */
  firstPassMultiPv: 2,
  /** Deeper look at candidate brilliant, great, miss, and blunder positions. */
  multiPv: 3,

  /** Half-moves stored on the best continuation. */
  bestLinePlies: 5,
  bestLinePreview: 3,

  /** Second line still acceptable, while the played move is already lost. */
  playableExpected: 0.42,
  collapseExpected: 0.22,
} as const;
