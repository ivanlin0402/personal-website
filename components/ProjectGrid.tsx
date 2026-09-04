import type { Project } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";

type ProjectGridProps = {
  projects: Project[];
  emptyMessage?: string;
};

export function ProjectGrid({
  projects,
  emptyMessage = "No projects found.",
}: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-dim">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
