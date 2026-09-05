import type { ReactNode } from "react";
import type { Project } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Tag } from "@/components/Tag";

type ProjectHeaderProps = {
  project: Project;
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const metaParts: ReactNode[] = [];

  if (project.status) {
    metaParts.push(
      <span key="status" className="inline-flex items-center gap-2">
        <StatusBadge status={project.status} />
      </span>,
    );
  }

  metaParts.push(
    <span key="category" className="inline-flex items-center gap-2">
      <Tag>{project.category}</Tag>
    </span>,
  );

  if (project.year) {
    metaParts.push(
      <span key="year" className="font-medium text-muted">
        {project.year}
      </span>,
    );
  }

  return (
    <header className="border-b border-border pb-8">
      <h1 className="font-heading text-[1.875rem] font-semibold tracking-tight text-foreground sm:text-[2.25rem]">
        {project.title}
      </h1>

      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 text-[13px] text-dim">
        {metaParts.map((part, index) => (
          <span key={index} className="inline-flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">·</span> : null}
            {part}
          </span>
        ))}
      </div>

      {project.tags && project.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}
    </header>
  );
}
