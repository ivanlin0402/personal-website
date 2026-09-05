"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/lib/types";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProjectGrid } from "@/components/ProjectGrid";
import { useLanguage } from "@/components/LanguageProvider";

const ALL_KEY = "__all__";

type ProjectsExplorerProps = {
  projects: Project[];
  categories: string[];
};

export function ProjectsExplorer({
  projects,
  categories,
}: ProjectsExplorerProps) {
  const [active, setActive] = useState(ALL_KEY);
  const { t } = useLanguage();

  const filtered = useMemo(() => {
    if (active === ALL_KEY) return projects;
    return projects.filter((project) => project.category === active);
  }, [active, projects]);

  const options = [
    { key: ALL_KEY, label: t.projectsPage.all },
    ...categories.map((category) => ({
      key: category,
      label: t.categories[category] ?? category,
    })),
  ];

  return (
    <div>
      <CategoryFilter
        options={options}
        active={active}
        onChange={setActive}
      />
      <ProjectGrid
        projects={filtered}
        emptyMessage={t.projectsPage.empty}
      />
    </div>
  );
}
