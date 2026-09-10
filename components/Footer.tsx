"use client";

import Link from "next/link";
import { VisitorCount } from "@/components/VisitorCount";
import { useLanguage } from "@/components/LanguageProvider";
import { siteConfig } from "@/data/site";

export function Footer() {
  const { t } = useLanguage();

  const navLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.contact, href: "/contact" },
  ];

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container-page flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] text-muted transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="flex flex-wrap items-center text-[13px] text-muted sm:justify-end">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
            <VisitorCount />
          </span>
          {siteConfig.socialLinks.map((link) => (
            <span key={link.label} className="inline-flex items-center">
              <span className="mx-2 text-dim" aria-hidden="true">
                ·
              </span>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            </span>
          ))}
        </p>
      </div>
    </footer>
  );
}
