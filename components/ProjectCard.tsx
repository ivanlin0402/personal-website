import Link from "next/link";
import type { Project } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Tag } from "@/components/Tag";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:bg-card-hover"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Tag>{project.category}</Tag>
        {project.status ? <StatusBadge status={project.status} /> : null}
      </div>

      <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
        {project.title}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      {project.tags && project.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}

      <span className="mt-4 text-[13px] font-medium text-dim transition-colors duration-200 group-hover:text-accent">
        View project →
      </span>
    </Link>
  );
}
