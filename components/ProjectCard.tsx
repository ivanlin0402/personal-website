"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Tag } from "@/components/Tag";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeProject } from "@/lib/i18n/project";
import type { ProjectWithI18n } from "@/lib/i18n/project";

type ProjectCardProps = {
  project: Project | ProjectWithI18n;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const { t, locale } = useLanguage();
  const localized = localizeProject(project, locale);
  const categoryLabel =
    t.categories[localized.category] ?? localized.category;

  return (
    <Link
      href={`/projects/${localized.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tag>{categoryLabel}</Tag>
        {localized.status ? <StatusBadge status={localized.status} /> : null}
      </div>

      <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
        {localized.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {localized.description}
      </p>

      {localized.tags && localized.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {localized.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{t.tags[tag] ?? tag}</Tag>
          ))}
        </div>
      ) : null}

      <span className="mt-4 text-[13px] font-medium text-dim transition-colors duration-200 group-hover:text-accent">
        {t.project.viewProject}
      </span>
    </Link>
  );
}
