"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import { formatWhiteEval, graphPawns } from "@/lib/review/evaluation";
import { explainMove } from "@/lib/review/explainMove";
import { reviewConfig } from "@/lib/review/reviewConfig";
import { CLASSIFICATIONS, type Classification, type GameReview, type MoveReview } from "@/lib/review/reviewTypes";

const LABEL: Record<Locale, Record<(typeof CLASSIFICATIONS)[number], string>> = {
  en: {
    brilliant: "Brilliant",
    great: "Great",
    best: "Best",
    excellent: "Excellent",
    good: "Good",
    inaccuracy: "Inaccuracy",
    mistake: "Mistake",
    miss: "Miss",
    blunder: "Blunder",
  },
  zh: {
    brilliant: "精彩",
    great: "好棋",
    best: "最佳",
    excellent: "優秀",
    good: "好",
    inaccuracy: "不準確",
    mistake: "錯著",
    miss: "錯過",
    blunder: "漏著",
  },
};

const MOMENT: Partial<Record<Classification, string>> = {
  brilliant: "#00c2d1",
  great: "#4c8dff",
  miss: "#e15b64",
  mistake: "#e08a3c",
  blunder: "#d64545",
};

export function classLabel(locale: Locale, key: keyof typeof LABEL.en): string {
  return LABEL[locale][key];
}

function formatAccuracy(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function GameReviewPanel({
  locale,
  review,
  move,
  progress,
  running,
  failed,
  failedLabel,
  onReview,
  onCancel,
  onJump,
  reviewLabel,
  cancelLabel,
  analyzingLabel,
  accuracyLabel,
  beforeLabel,
  afterLabel,
  bestLabel,
  bestLineLabel,
  showLineLabel,
  hideLineLabel,
  debugLabel,
}: {
  locale: Locale;
  review: GameReview | null;
  move: MoveReview | null;
  progress: { done: number; total: number } | null;
  running: boolean;
  failed: boolean;
  failedLabel: string;
  onReview: () => void;
  onCancel: () => void;
  onJump: (ply: number) => void;
  reviewLabel: string;
  cancelLabel: string;
  analyzingLabel: string;
  accuracyLabel: string;
  beforeLabel: string;
  afterLabel: string;
  bestLabel: string;
  bestLineLabel: string;
  showLineLabel: string;
  hideLineLabel: string;
  debugLabel: string;
}) {
  const [expandedPly, setExpandedPly] = useState<number | null>(null);
  const [debug, setDebug] = useState(false);
  const line = move?.bestLine ?? [];
  const preview = reviewConfig.bestLinePreview;
  const showFullLine = move != null && expandedPly === move.ply;
  const visibleLine = showFullLine ? line : line.slice(0, preview);
  const showBestLine = move != null && move.bestUci !== move.uci && line.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        {running ? (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-border px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-background-secondary"
          >
            {cancelLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={onReview}
            className="h-10 rounded-lg bg-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {reviewLabel}
          </button>
        )}
        {progress ? (
          <p className="text-[13px] text-dim">
            {analyzingLabel} {progress.done} / {progress.total}
          </p>
        ) : null}
        {failed ? <p className="text-[13px] text-[#e0a3a3]">{failedLabel}</p> : null}
        {move ? (
          <button
            type="button"
            onClick={() => setDebug((value) => !value)}
            className={`h-10 rounded-lg border px-3 text-[13px] font-medium transition-colors ${
              debug ? "border-border-hover bg-background-secondary text-foreground" : "border-border text-dim hover:text-foreground"
            }`}
          >
            {debugLabel}
          </button>
        ) : null}
      </div>

      {move ? (
        <div className="mt-3">
          <p className="font-heading text-base font-semibold text-foreground">
            {move.color === "white" ? `${move.moveNumber}. ${move.san}` : `${move.moveNumber}... ${move.san}`}
          </p>
          <p className="mt-1 text-sm font-medium text-accent">{classLabel(locale, move.classification)}</p>
          <p className="mt-1 text-[13px] text-muted">
            {accuracyLabel}: {formatAccuracy(move.moveAccuracy)}
          </p>
          <p className="mt-2 text-[13px] text-muted">
            {beforeLabel}: {formatWhiteEval(move.evaluationBefore)}
            {" · "}
            {afterLabel}: {formatWhiteEval(move.evaluationAfter)}
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {bestLabel}: {move.bestMove}
          </p>
          {showBestLine ? (
            <div className="mt-2">
              <p className="text-[13px] leading-relaxed text-foreground">
                {bestLineLabel}: {visibleLine.join(" ")}
              </p>
              {line.length > preview ? (
                <button
                  type="button"
                  onClick={() => setExpandedPly(showFullLine ? null : move.ply)}
                  className="mt-1 text-[12px] text-dim hover:text-foreground"
                >
                  {showFullLine ? hideLineLabel : showLineLabel}
                </button>
              ) : null}
            </div>
          ) : null}
          <p className="mt-2 text-sm leading-relaxed text-foreground">{explainMove(move, locale)}</p>
          {debug ? <DebugBlock move={move} /> : null}
        </div>
      ) : null}

      {review && !running && review.moves.length > 1 ? (
        <EvalGraph moves={review.moves} selectedPly={move?.ply ?? review.moves.length} onSelect={onJump} />
      ) : null}

      {review && !running ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(["white", "black"] as const).map((color) => (
            <div key={color}>
              <p className="text-[13px] font-semibold text-foreground">
                {color === "white" ? (locale === "zh" ? "白方" : "White") : locale === "zh" ? "黑方" : "Black"}
              </p>
              <p className="mt-0.5 text-[13px] text-foreground">
                {accuracyLabel}: {formatAccuracy(color === "white" ? review.whiteAccuracy : review.blackAccuracy)}
              </p>
              <ul className="mt-1 space-y-0.5 text-[12px] text-dim">
                {CLASSIFICATIONS.map((key) => (
                  <li key={key} className="flex justify-between gap-3">
                    <span>{classLabel(locale, key)}</span>
                    <span>{review[color][key]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DebugBlock({ move }: { move: MoveReview }) {
  const cpl = move.centipawnLoss == null ? "mate" : String(move.centipawnLoss);
  const verdict = move.brilliant;
  const sacrifice = move.features.sacrificeCandidate;
  const rank = move.features.engineRank == null ? "not in the top lines" : `#${move.features.engineRank}`;
  return (
    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg bg-background-secondary p-2 font-mono text-[11px] leading-relaxed text-dim">
      {`Engine rank: ${rank}
Near best: ${verdict.nearBest ? "YES" : "NO"}

Expected Points:
before: ${move.winChanceBefore.toFixed(2)}
after: ${move.winChanceAfter.toFixed(2)}
loss: ${move.winChanceLoss.toFixed(2)}

Eval before: ${formatWhiteEval(move.evaluationBefore)}
Eval after: ${formatWhiteEval(move.evaluationAfter)}
CPL: ${cpl}

Material before: ${sacrifice.materialBefore}
Material immediately after: ${sacrifice.materialImmediatelyAfter}

Sacrifice detected: ${sacrifice.isSacrificeCandidate ? "YES" : "NO"}
Sacrifice type: ${sacrifice.type}${sacrifice.sacrificedPiece ? ` ${sacrifice.sacrificedPiece}` : ""}
Offered value: ${sacrifice.materialValue}
Compensation: ${sacrifice.compensationFound ? sacrifice.compensationType : "none"}
PV: ${sacrifice.forcedSequence.join(" ") || move.bestLine.join(" ")}

Already completely winning: ${verdict.alreadyWinning ? "YES" : "NO"}
Rating adjustment: ${move.features.playerRating ?? "unrated"} → ${verdict.thresholds.generosity}

FINAL: ${verdict.accepted ? "BRILLIANT" : "NOT BRILLIANT"}
${verdict.reason}

Weight: ${move.moveWeight.toFixed(2)}
Move accuracy: ${move.moveAccuracy.toFixed(1)}
${move.variation.map((line, index) => `#${index + 1} ${line.san} ${line.evaluation}`).join("\n")}`}
    </pre>
  );
}

function EvalGraph({
  moves,
  selectedPly,
  onSelect,
}: {
  moves: MoveReview[];
  selectedPly: number;
  onSelect: (ply: number) => void;
}) {
  const width = 320;
  const height = 88;
  const mid = height / 2;
  const last = Math.max(1, moves.length - 1);
  const points = moves.map((move, index) => {
    const x = (index / last) * width;
    const y = mid - (graphPawns(move.evaluationAfter) / 8) * (mid - 8);
    return { move, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full" aria-hidden="true">
        <line x1="0" y1={mid} x2={width} y2={mid} stroke="currentColor" strokeOpacity="0.25" />
        <path d={path} fill="none" stroke="currentColor" className="text-accent" strokeWidth="2" />
        {points.map((point) => {
          const color = MOMENT[point.move.classification];
          if (!color && point.move.ply !== selectedPly) return null;
          return (
            <circle
              key={point.move.ply}
              cx={point.x}
              cy={point.y}
              r={point.move.ply === selectedPly ? 4.5 : 3.2}
              fill={color ?? "#d7deea"}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex">
        {moves.map((move) => (
          <button
            key={move.ply}
            type="button"
            aria-label={`${move.moveNumber} ${move.san}`}
            onClick={() => onSelect(move.ply)}
            className="h-full flex-1"
          />
        ))}
      </div>
    </div>
  );
}
