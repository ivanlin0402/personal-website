import type { TimelineItem } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

type TimelineProps = {
  items: TimelineItem[];
};

export function Timeline({ items }: TimelineProps) {
  if (items.length === 0) return null;

  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {items.map((item, index) => (
        <li key={`${item.stage}-${index}`} className="relative">
          <span className="absolute -left-[1.4rem] top-1.5 h-2 w-2 rounded-full border border-border bg-background-secondary" />
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.stage} />
            {item.date ? (
              <span className="text-[12px] text-dim">{item.date}</span>
            ) : null}
          </div>
          {item.note ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {item.note}
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
