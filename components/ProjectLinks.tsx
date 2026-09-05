import { Button } from "@/components/Button";
import type { Project } from "@/lib/types";

type ProjectLinksProps = {
  project: Project;
};

type LinkItem = {
  label: string;
  href: string;
};

/**
 * Renders optional GitHub / Demo / Documentation buttons from project data.
 */
export function ProjectLinks({ project }: ProjectLinksProps) {
  const links: LinkItem[] = [];

  if (project.githubUrl) {
    links.push({ label: "GitHub", href: project.githubUrl });
  }
  if (project.demoUrl) {
    links.push({ label: "Demo", href: project.demoUrl });
  }
  if (project.documentationUrl) {
    links.push({ label: "Documentation", href: project.documentationUrl });
  }

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2.5">
      {links.map((link) => (
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
  );
}
