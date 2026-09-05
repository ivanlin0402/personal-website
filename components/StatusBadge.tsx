"use client";

import type { ProjectStatus } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

const statusStyles: Record<ProjectStatus, string> = {
  Idea: "bg-background-secondary text-muted border-border",
  Planning: "bg-background-secondary text-[#c4a574] border-[#3a3428]",
  "In Progress": "bg-accent-soft text-[#9bb8f0] border-[#2a3a55]",
  Testing: "bg-background-secondary text-[#a8a0c4] border-[#2e2c3a]",
  Completed: "bg-background-secondary text-[#8fb89a] border-[#2a3a30]",
};

type StatusBadgeProps = {
  status: ProjectStatus;
  className?: string;
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const { t } = useLanguage();

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[12px] font-medium ${statusStyles[status]} ${className}`}
    >
      {t.status[status]}
    </span>
  );
}
