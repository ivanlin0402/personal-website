import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
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

      <ProjectDetail project={project} />
    </div>
  );
}
