"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProjectGrid } from "@/components/ProjectGrid";

type ProjectsExplorerProps = {
  projects: Project[];
  categories: string[];
};

export function ProjectsExplorer({
  projects,
  categories,
}: ProjectsExplorerProps) {
  const [active, setActive] = useState("All");

  const filtered = useMemo(() => {
    if (active === "All") return projects;
    return projects.filter((project) => project.category === active);
  }, [active, projects]);

  return (
    <div>
      <CategoryFilter
        categories={categories}
        active={active}
        onChange={setActive}
      />
      <ProjectGrid
        projects={filtered}
        emptyMessage="No projects in this category yet."
      />
    </div>
  );
}
