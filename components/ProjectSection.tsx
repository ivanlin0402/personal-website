type ProjectSectionProps = {
  title: string;
  children: React.ReactNode;
};

/**
 * Documentation-style section used on project detail pages.
 * Only render this when the section has real content.
 */
export function ProjectSection({ title, children }: ProjectSectionProps) {
  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <h2 className="font-heading mb-3 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function ProjectParagraph({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed text-muted">{children}</p>;
}

export function ProjectList({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
