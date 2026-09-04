import type { Project } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { Tag } from "@/components/Tag";

type ProjectHeaderProps = {
  project: Project;
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <header className="border-b border-border pb-8">
      <h1 className="font-heading text-[1.875rem] font-semibold tracking-tight text-foreground sm:text-[2.25rem]">
        {project.title}
      </h1>

      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        {project.status ? (
          <div className="flex items-center gap-2">
            <span className="text-dim">Status</span>
            <StatusBadge status={project.status} />
          </div>
        ) : null}
        {project.year ? (
          <div className="flex items-center gap-2">
            <span className="text-dim">Year</span>
            <span className="font-medium text-muted">{project.year}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <span className="text-dim">Category</span>
          <Tag>{project.category}</Tag>
        </div>
      </div>

      {project.tags && project.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-dim">Tags</span>
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}
    </header>
  );
}
