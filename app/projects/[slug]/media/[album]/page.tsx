import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaAlbumPageContent } from "@/components/MediaAlbumPageContent";
import { getAllProjects, getProjectBySlug } from "@/data/projects";

type MediaAlbumPageProps = {
  params: Promise<{ slug: string; album: string }>;
};

export function generateStaticParams() {
  return getAllProjects().flatMap((project) =>
    (project.mediaAlbums ?? []).map((album) => ({
      slug: project.slug,
      album: album.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: MediaAlbumPageProps): Promise<Metadata> {
  const { slug, album: albumSlug } = await params;
  const project = getProjectBySlug(slug);
  const album = project?.mediaAlbums?.find((item) => item.slug === albumSlug);
  if (!project || !album) return { title: "Album not found" };
  return {
    title: `${album.title} · ${project.title}`,
    description: album.description ?? project.description,
  };
}

export default async function MediaAlbumPage({ params }: MediaAlbumPageProps) {
  const { slug, album: albumSlug } = await params;
  const project = getProjectBySlug(slug);
  const album = project?.mediaAlbums?.find((item) => item.slug === albumSlug);

  if (!project || !album) notFound();

  return <MediaAlbumPageContent project={project} album={album} />;
}
