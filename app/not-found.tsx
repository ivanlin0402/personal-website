"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="container-narrow flex flex-col items-start py-20 sm:py-24">
      <p className="text-[13px] font-medium text-dim">404</p>
      <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {t.notFound.title}
      </h1>
      <p className="mt-2 text-sm text-muted">{t.notFound.description}</p>
      <Link
        href="/"
        className="mt-6 text-[13px] font-medium text-muted transition-colors duration-200 hover:text-accent"
      >
        {t.notFound.backHome}
      </Link>
    </div>
  );
}
