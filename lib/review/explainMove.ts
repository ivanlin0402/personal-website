import type { Locale } from "@/lib/i18n/config";
import { formatWhiteEval } from "@/lib/review/evaluation";
import type { MoveReview, SacrificedPiece } from "@/lib/review/reviewTypes";

const PIECE_EN: Record<Exclude<SacrificedPiece, null>, string> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
};

const PIECE_ZH: Record<Exclude<SacrificedPiece, null>, string> = {
  p: "兵",
  n: "馬",
  b: "象",
  r: "車",
  q: "后",
};

export function explainMove(move: MoveReview, locale: Locale): string {
  const best = move.bestMove;
  const { features, classification } = move;
  const before = formatWhiteEval(move.evaluationBefore);
  const after = formatWhiteEval(move.evaluationAfter);
  const piece = features.sacrificedPiece;
  const beforeMate = features.playerBefore.kind === "mate" ? features.playerBefore.mate : null;

  if (features.onlyLegalMove) {
    return locale === "zh" ? "這是唯一的合法著法。" : "This was the only legal move.";
  }

  if (locale === "zh") {
    if (classification === "brilliant") {
      const name = piece ? PIECE_ZH[piece] : "子力";
      return `精彩！棄${name}是成立的。棄子之後局面仍然有利，而且不是被迫的。`;
    }
    if (classification === "great") {
      return `好棋！${best} 是能守住局面的關鍵著法。其他自然的選擇會讓結果差很多。`;
    }
    if (classification === "best") {
      return features.book
        ? `最佳著法。${best} 也是開局理論中的一步。`
        : `這是這個局面裡最強的著法。`;
    }
    if (classification === "excellent") return `優秀。幾乎和引擎首選 ${best} 一樣好。`;
    if (classification === "good") {
      return features.book
        ? `好的一步。這是正常的開局著法，引擎略偏好 ${best}。`
        : `好的一步。勝勢掉得不多，引擎更喜歡 ${best}。`;
    }
    if (classification === "inaccuracy") return `不準確。局面變差了一些，但還救得回來。更強的是 ${best}。`;
    if (classification === "mistake") return `錯著。這步讓你的勝算明顯下降。你可以走 ${best}。`;
    if (classification === "miss") {
      if (beforeMate != null && beforeMate > 0) return `錯過。這裡有 ${beforeMate} 步內的將死，${best} 能把握住。`;
      if (features.bestCapturesFreePiece) return `錯過。${best} 可以吃到沒有保護的棋子。`;
      return `錯過。你沒有把握住 ${best} 這個明顯更好的機會。`;
    }
    const extra = features.hungQueen ? "后現在會被吃到。" : `局面從 ${before} 變成 ${after}。`;
    return `漏著。這步大幅改變了這盤棋的結果。${extra}更好的是 ${best}。`;
  }

  if (classification === "brilliant") {
    const name = piece ? PIECE_EN[piece] : "piece";
    return `Brilliant! This ${name} sacrifice is sound. Giving it up keeps a favorable position, and it was not forced.`;
  }
  if (classification === "great") {
    return `Great move! ${best} is the move that holds the position. The natural alternatives give away much more.`;
  }
  if (classification === "best") {
    return features.book
      ? `Best move. ${best} also follows the book line.`
      : "This is the strongest move in the position.";
  }
  if (classification === "excellent") return `Excellent. This is almost as strong as ${best}.`;
  if (classification === "good") {
    return features.book
      ? `Good move. This is a normal opening choice. The engine slightly prefers ${best}.`
      : `Good move. The expected result only dips a little. The engine prefers ${best}.`;
  }
  if (classification === "inaccuracy") {
    return `Inaccuracy. The position gets worse, but it is still recoverable. ${best} was stronger.`;
  }
  if (classification === "mistake") {
    return `Mistake. This gives up a large part of your chances. ${best} was the move to play.`;
  }
  if (classification === "miss") {
    if (beforeMate != null && beforeMate > 0) {
      return `Miss. There was mate in ${beforeMate}. ${best} was the way to play it.`;
    }
    if (features.bestCapturesFreePiece) {
      return `Miss. ${best} wins a free piece.`;
    }
    return `Miss. You passed up a clear chance. ${best} was much stronger than the move played.`;
  }
  const extra = features.hungQueen ? " The queen is now left hanging." : ` The evaluation goes from ${before} to ${after}.`;
  return `Blunder. This changes the result of the position.${extra} Best was ${best}.`;
}
