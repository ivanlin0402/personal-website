"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { Tag } from "@/components/Tag";
import { useLanguage } from "@/components/LanguageProvider";

export default function AboutPage() {
  const { t, site } = useLanguage();
  const labels = t.aboutPage;
  const about = site.about;

  return (
    <div className="container-narrow py-12 sm:py-16">
      <SectionHeading title={labels.title} description={labels.description} />

      <div className="space-y-10">
        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {labels.introduction}
          </h3>
          <p className="text-base leading-relaxed text-muted">
            {about.introduction}
          </p>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {labels.interests}
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            {about.interests.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {labels.skills}
          </h3>
          <div className="flex flex-wrap gap-2">
            {about.skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {labels.learning}
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            {about.learning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {labels.background}
          </h3>
          <p className="text-base leading-relaxed text-muted">
            {about.background}
          </p>
        </section>
      </div>
    </div>
  );
}
