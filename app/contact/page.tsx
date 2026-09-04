import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name}`,
};

export default function ContactPage() {
  return (
    <div className="container-narrow py-12 sm:py-16">
      <SectionHeading
        title="Contact"
        description="Simple ways to reach me."
      />

      <div className="divide-y divide-border border-y border-border">
        <a
          href={`mailto:${siteConfig.email}`}
          className="flex items-center justify-between py-4 text-white transition-colors duration-200 hover:text-accent"
        >
          <div>
            <p className="text-[13px] text-white/50">Email</p>
            <p className="mt-1 text-sm text-white">{siteConfig.email}</p>
          </div>
          <span className="text-white/50">→</span>
        </a>

        {siteConfig.socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-4 text-white transition-colors duration-200 hover:text-accent"
          >
            <div>
              <p className="text-[13px] text-white/50">{link.label}</p>
              <p className="mt-1 text-sm text-white">
                {link.href.replace(/^https?:\/\//, "")}
              </p>
            </div>
            <span className="text-white/50">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
