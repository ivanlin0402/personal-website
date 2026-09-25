"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Tag } from "@/components/Tag";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeProject } from "@/lib/i18n/project";
import type { ProjectWithI18n } from "@/lib/i18n/project";
import { withBasePath } from "@/lib/paths";

type ProjectCardProps = {
  project: Project | ProjectWithI18n;
};

const fallbackLook: Record<string, { panel: string; mark: string }> = {
  "pc-donation": {
    panel: "bg-[#1c1814] text-[#d7c4a3]",
    mark: "PC",
  },
  "cnmc-website": {
    panel: "bg-[#121c1a] text-[#b7d4c8]",
    mark: "CNMC",
  },
  chess: {
    panel: "bg-[#1a2214] text-[#d7e2c4]",
    mark: "♟",
  },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { t, locale } = useLanguage();
  const localized = localizeProject(project, locale);
  const categoryLabel = t.categories[localized.category] ?? localized.category;
  const fallback = fallbackLook[localized.slug] ?? {
    panel: "bg-background-secondary text-muted",
    mark: categoryLabel,
  };
  const tags = (localized.tags ?? []).slice(0, 2);

  return (
    <Link
      href={`/projects/${localized.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
    >
      <div className="relative aspect-video overflow-hidden border-b border-border bg-black">
        {localized.cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export
          <img
            src={withBasePath(localized.cover)}
            alt=""
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain object-center transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center ${fallback.panel}`}
          >
            <span className="font-heading text-3xl font-semibold tracking-tight">
              {fallback.mark}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-dim">
          {categoryLabel}
          {localized.year ? ` · ${localized.year}` : ""}
        </p>

        <h3 className="font-heading mt-2 text-base font-semibold tracking-tight text-foreground">
          {localized.title}
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {localized.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {localized.status ? <StatusBadge status={localized.status} /> : null}
          {tags.map((tag) => (
            <Tag key={tag}>{t.tags[tag] ?? tag}</Tag>
          ))}
        </div>

        <span className="mt-4 text-[13px] font-medium text-dim transition-colors duration-200 group-hover:text-accent">
          {t.project.viewProject}
        </span>
      </div>
    </Link>
  );
}
