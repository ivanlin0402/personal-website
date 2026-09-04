import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Tag } from "@/components/Tag";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.name}`,
};

export default function AboutPage() {
  const { about } = siteConfig;

  return (
    <div className="container-narrow py-12 sm:py-16">
      <SectionHeading
        title="About"
        description="A short look at who I am, what I care about, and what I'm exploring."
      />

      <div className="space-y-10">
        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            Introduction
          </h3>
          <p className="text-base leading-relaxed text-muted">
            {about.introduction}
          </p>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            Interests
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            {about.interests.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            Currently Learning
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            {about.learning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            Background
          </h3>
          <p className="text-base leading-relaxed text-muted">
            {about.background}
          </p>
        </section>
      </div>
    </div>
  );
}
