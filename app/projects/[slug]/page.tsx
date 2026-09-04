import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/Button";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Timeline } from "@/components/Timeline";
import { getAllProjects, getProjectBySlug } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
  };
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div className="container-narrow py-12 sm:py-16">
      <Link
        href="/projects"
        className="mb-8 inline-flex text-[13px] text-dim transition-colors duration-200 hover:text-muted"
      >
        ← All projects
      </Link>

      <ProjectHeader project={project} />

      <div className="mt-2">
        {project.overview ? (
          <DetailSection title="Overview">
            <p className="text-base leading-relaxed text-muted">
              {project.overview}
            </p>
          </DetailSection>
        ) : null}

        {project.motivation ? (
          <DetailSection title="Motivation">
            <p className="text-base leading-relaxed text-muted">
              {project.motivation}
            </p>
          </DetailSection>
        ) : null}

        {project.goals && project.goals.length > 0 ? (
          <DetailSection title="Goals">
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
              {project.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </DetailSection>
        ) : null}

        {project.process ? (
          <DetailSection title="Process">
            <p className="text-base leading-relaxed text-muted">
              {project.process}
            </p>
          </DetailSection>
        ) : null}

        {project.timeline && project.timeline.length > 0 ? (
          <DetailSection title="Progress">
            <Timeline items={project.timeline} />
          </DetailSection>
        ) : null}

        {project.results ? (
          <DetailSection title="Results">
            <p className="text-base leading-relaxed text-muted">
              {project.results}
            </p>
          </DetailSection>
        ) : null}

        {project.lessons && project.lessons.length > 0 ? (
          <DetailSection title="What I Learned">
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
              {project.lessons.map((lesson) => (
                <li key={lesson}>{lesson}</li>
              ))}
            </ul>
          </DetailSection>
        ) : null}

        {project.mediaNote ? (
          <DetailSection title="Media">
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-dim">
              {project.mediaNote}
            </p>
          </DetailSection>
        ) : null}

        {project.links && project.links.length > 0 ? (
          <DetailSection title="Links">
            <div className="flex flex-wrap gap-2.5">
              {project.links.map((link) => (
                <Button
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  variant="secondary"
                  external={link.href.startsWith("http")}
                >
                  {link.label}
                </Button>
              ))}
            </div>
          </DetailSection>
        ) : null}
      </div>
    </div>
  );
}
