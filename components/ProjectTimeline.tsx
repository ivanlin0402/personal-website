"use client";

import type { ProjectUpdate, UpdateStatus } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

type ProjectTimelineProps = {
  updates: ProjectUpdate[];
};

const dotStyles: Record<UpdateStatus, string> = {
  completed: "border-muted bg-muted/40",
  current: "border-accent bg-accent/30",
  upcoming: "border-border bg-background",
};

const labelStyles: Record<UpdateStatus, string> = {
  completed: "text-dim",
  current: "text-accent",
  upcoming: "text-dim",
};

export function ProjectTimeline({ updates }: ProjectTimelineProps) {
  const { t } = useLanguage();

  if (updates.length === 0) return null;

  return (
    <ol className="relative space-y-6 border-l border-border pl-5">
      {updates.map((update, index) => {
        const status = update.status;
        const dotClass = status
          ? dotStyles[status]
          : "border-border bg-background-secondary";

        return (
          <li
            key={`${update.date}-${update.title}-${index}`}
            className="relative"
          >
            <span
              className={`absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full border ${dotClass}`}
            />

            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <time className="text-[12px] font-medium text-dim">
                {update.date}
              </time>
              {status ? (
                <span
                  className={`text-[12px] font-medium ${labelStyles[status]}`}
                >
                  · {t.updateStatus[status]}
                </span>
              ) : null}
            </div>

            <h3 className="mt-1 text-sm font-medium text-foreground">
              {update.title}
            </h3>

            {update.description ? (
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {update.description}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
