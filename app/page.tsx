"use client";

import { Button } from "@/components/Button";
import { CTASection } from "@/components/CTASection";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import { getFeaturedProjects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import { formatGreeting } from "@/lib/i18n/dictionary";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const { t, site } = useLanguage();

  return (
    <div className="container-page py-12 sm:py-16">
      <section className="relative max-w-xl pb-16 pt-4 sm:pb-20 sm:pt-8">
        <p className="animate-fade-in mb-3 text-[13px] font-medium text-dim">
          {t.home.eyebrow}
        </p>
        <h1 className="animate-fade-in font-heading text-[2.25rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[3.25rem]">
          {formatGreeting(t.home.greeting, siteConfig.name)}
        </h1>
        <p className="animate-fade-in-delay mt-4 text-base leading-relaxed text-muted sm:text-lg">
          {site.tagline}
        </p>
        <div className="animate-fade-in-delay-2 mt-6">
          <Button href="/projects">{t.home.viewProjects}</Button>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <SectionHeading
          title={t.home.featuredTitle}
          description={t.home.featuredDescription}
        />
        <ProjectGrid projects={featured} />
      </section>

      <CTASection
        title={t.home.ctaTitle}
        description={t.home.ctaDescription}
        buttonLabel={t.home.ctaButton}
        buttonHref="/projects"
      />
    </div>
  );
}
