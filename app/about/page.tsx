"use client";

import { SectionHeading } from "@/components/SectionHeading";
import { Tag } from "@/components/Tag";
import { useLanguage } from "@/components/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();
  const about = t.aboutPage;

  return (
    <div className="container-narrow py-12 sm:py-16">
      <SectionHeading title={about.title} description={about.description} />

      <div className="space-y-10">
        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {about.introduction}
          </h3>
          <p className="text-base leading-relaxed text-muted">
            {about.introductionText}
          </p>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {about.interests}
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            {about.interestsList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {about.skills}
          </h3>
          <div className="flex flex-wrap gap-2">
            {about.skillsList.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </div>
        </section>

        <section className="border-b border-border pb-10">
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {about.learning}
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted">
            {about.learningList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-heading mb-3 text-base font-semibold text-foreground">
            {about.background}
          </h3>
          <p className="text-base leading-relaxed text-muted">
            {about.backgroundText}
          </p>
        </section>
      </div>
    </div>
  );
}
