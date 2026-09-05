import type { Project } from "@/lib/types";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectLinks } from "@/components/ProjectLinks";
import {
  ProjectList,
  ProjectParagraph,
  ProjectSection,
} from "@/components/ProjectSection";
import { ProjectTimeline } from "@/components/ProjectTimeline";

type ProjectDetailProps = {
  project: Project;
};

/**
 * Reusable project detail template.
 * Every section is optional — empty fields are omitted entirely.
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const hasLinks =
    Boolean(project.githubUrl) ||
    Boolean(project.demoUrl) ||
    Boolean(project.documentationUrl);

  return (
    <article>
      <ProjectHeader project={project} />

      <div className="mt-2">
        {project.overview ? (
          <ProjectSection title="Overview">
            <ProjectParagraph>{project.overview}</ProjectParagraph>
          </ProjectSection>
        ) : null}

        {project.goals && project.goals.length > 0 ? (
          <ProjectSection title="Goals">
            <ProjectList items={project.goals} />
          </ProjectSection>
        ) : null}

        {project.process && project.process.length > 0 ? (
          <ProjectSection title="Process">
            <ProjectList items={project.process} />
          </ProjectSection>
        ) : null}

        {project.technicalDetails && project.technicalDetails.length > 0 ? (
          <ProjectSection title="Technical Details">
            <ProjectList items={project.technicalDetails} />
          </ProjectSection>
        ) : null}

        {project.updates && project.updates.length > 0 ? (
          <ProjectSection title="Progress / Timeline">
            <ProjectTimeline updates={project.updates} />
          </ProjectSection>
        ) : null}

        {project.results && project.results.length > 0 ? (
          <ProjectSection title="Results">
            <ProjectList items={project.results} />
          </ProjectSection>
        ) : null}

        {project.lessons && project.lessons.length > 0 ? (
          <ProjectSection title="What I Learned">
            <ProjectList items={project.lessons} />
          </ProjectSection>
        ) : null}

        {project.media ? (
          <ProjectSection title="Media">
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-dim">
              {project.media}
            </p>
          </ProjectSection>
        ) : null}

        {hasLinks ? (
          <ProjectSection title="Links">
            <ProjectLinks project={project} />
          </ProjectSection>
        ) : null}
      </div>
    </article>
  );
}
