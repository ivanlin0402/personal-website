import { brilliantVerdict } from "@/lib/review/brilliant";
import { reviewConfig } from "@/lib/review/reviewConfig";
import type { Classification, MoveFeatures } from "@/lib/review/reviewTypes";

function gap(features: MoveFeatures): number {
  if (features.secondWinChance == null) return 0;
  return features.winChanceBefore - features.secondWinChance;
}

function allowedMate(features: MoveFeatures): boolean {
  const after = features.playerAfter;
  const before = features.playerBefore;
  return after.kind === "mate" && after.mate < 0 && !(before.kind === "mate" && before.mate < 0);
}

function keptOwnMate(features: MoveFeatures): boolean {
  return features.playerAfter.kind === "mate" && features.playerAfter.mate > 0;
}

function missedForcedMate(features: MoveFeatures): boolean {
  const before = features.playerBefore;
  if (before.kind !== "mate" || before.mate <= 0 || before.mate > reviewConfig.missMateDistance) return false;
  return !keptOwnMate(features);
}

/** The played move is far worse than the ordinary alternative, not just worse than one tactic. */
function worseThanAlternative(features: MoveFeatures): boolean {
  if (features.secondWinChance == null) return features.winChanceLoss >= reviewConfig.blunderThreshold;
  return features.winChanceAfter < features.secondWinChance - reviewConfig.mistakeThreshold;
}

function collapsed(features: MoveFeatures): boolean {
  if (allowedMate(features)) return true;
  if (
    features.hungQueen &&
    features.winChanceLoss >= reviewConfig.blunderThreshold &&
    worseThanAlternative(features)
  ) {
    return true;
  }
  const second = features.secondWinChance;
  const alternativeWasPlayable =
    second == null ? features.winChanceBefore >= reviewConfig.playableExpected : second >= reviewConfig.playableExpected;
  return (
    alternativeWasPlayable &&
    features.winChanceAfter <= reviewConfig.collapseExpected &&
    features.winChanceLoss >= reviewConfig.blunderThreshold &&
    worseThanAlternative(features)
  );
}

function canBeGreat(features: MoveFeatures): boolean {
  if (!features.playedIsBest || features.onlyLegalMove || features.forcedRecapture || features.legalMoves < 2) {
    return false;
  }
  if (features.winChanceLoss > reviewConfig.excellentThreshold) return false;
  const lineGap = gap(features);
  if (lineGap < reviewConfig.greatMoveMultiPVGap) return false;
  const second = features.secondWinChance ?? 0;
  if (features.winChanceBefore > 0.97 && second > 0.9) return false;
  if ((features.book || features.earlyPosition) && lineGap < reviewConfig.greatOpeningGap) return false;
  return true;
}

function canBeMiss(features: MoveFeatures): boolean {
  if (features.playedIsBest || worseThanAlternative(features)) return false;
  if (missedForcedMate(features)) return true;
  const lineGap = gap(features);
  const stoodOut = features.secondWinChance != null && lineGap >= reviewConfig.missStandout;
  const nearSecond =
    features.secondWinChance != null && features.winChanceAfter >= features.secondWinChance - reviewConfig.missNearSecond;
  if (features.bestCapturesFreePiece && stoodOut && nearSecond) return true;
  if (stoodOut && nearSecond && features.winChanceBefore >= reviewConfig.missMinChance && features.winChanceLoss >= reviewConfig.mistakeThreshold) {
    return true;
  }
  return false;
}

function bucket(features: MoveFeatures): Classification {
  const loss = features.winChanceLoss;
  let result: Classification;
  if (features.playedIsBest || loss <= reviewConfig.bestEquivalent) result = "best";
  else if (loss <= reviewConfig.excellentThreshold) result = "excellent";
  else if (loss <= reviewConfig.goodThreshold) result = "good";
  else if (loss <= reviewConfig.inaccuracyThreshold) result = "inaccuracy";
  else if (loss <= reviewConfig.mistakeThreshold) result = "mistake";
  else result = "blunder";

  const lineGap = features.secondWinChance == null ? 1 : features.winChanceBefore - features.secondWinChance;
  const quietOpening = features.book || (features.earlyPosition && lineGap <= reviewConfig.openingEqualGap);
  if (quietOpening && (result === "inaccuracy" || result === "mistake") && loss < reviewConfig.mistakeThreshold && !features.hungQueen) {
    return "good";
  }
  return result;
}

/**
 * Contextual resolver. Brilliant and Great are rare and checked first.
 * A game-changing collapse is a Blunder even when a tactic was also missed.
 * Miss is reserved for failing to take a standout chance. Ordinary buckets use
 * expected-score loss, with a softer cap for book and equivalent opening moves.
 */
export function classifyMove(features: MoveFeatures): Classification {
  if (features.onlyLegalMove) return "best";
  if (brilliantVerdict(features).accepted) return "brilliant";
  if (collapsed(features)) return "blunder";
  if (features.book) return "book";
  if (canBeGreat(features)) return "great";
  if (canBeMiss(features)) return "miss";
  return bucket(features);
}
