"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { CTASection } from "@/components/CTASection";
import { ProjectGrid } from "@/components/ProjectGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { useLanguage } from "@/components/LanguageProvider";
import { getFeaturedProjects } from "@/data/projects";
import { getDisplayName } from "@/data/site";
import { withBasePath } from "@/lib/paths";

export default function HomePage() {
  const featured = getFeaturedProjects();
  const { t, site, locale } = useLanguage();
  const name = getDisplayName(locale);
  const [greetingBefore, greetingAfter = ""] = t.home.greeting.split("{name}");
  const hero =
    featured.find((project) => project.slug === "game-project") ??
    featured.find((project) => project.cover);

  return (
    <div className="container-page py-12 sm:py-16">
      <section className="grid items-center gap-10 pb-16 pt-4 sm:pb-20 sm:pt-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div className="max-w-xl">
          <p className="animate-fade-in mb-3 text-[13px] font-medium text-dim">
            {t.home.eyebrow}
          </p>
          <h1 className="animate-fade-in font-heading text-[2.25rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-[3.25rem]">
            {greetingBefore}
            <span className="text-accent">{name}</span>
            {greetingAfter}
          </h1>
          <p className="animate-fade-in-delay mt-4 text-base leading-relaxed text-muted sm:text-lg">
            {site.tagline}
          </p>
          <div className="animate-fade-in-delay-2 mt-6">
            <Button href="/projects">{t.home.viewProjects}</Button>
          </div>
        </div>

        {hero?.cover ? (
          <Link
            href={`/projects/${hero.slug}`}
            className="group animate-fade-in-delay block overflow-hidden rounded-2xl border border-border bg-black"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- need withBasePath for GitHub Pages static export */}
            <img
              src={withBasePath(hero.cover)}
              alt={hero.title}
              width={1280}
              height={720}
              decoding="async"
              className="aspect-video w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </Link>
        ) : null}
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
