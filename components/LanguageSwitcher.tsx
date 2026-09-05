"use client";

import { locales, localeLabels, type Locale } from "@/lib/i18n/config";
import { useLanguage } from "@/components/LanguageProvider";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className={`inline-flex items-center ${className}`}>
      <span className="sr-only">{t.language}</span>
      <select
        aria-label={t.language}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="rounded-md border border-border bg-card px-2 py-1.5 text-[13px] font-medium text-foreground outline-none transition-colors duration-200 hover:border-border-hover focus:border-accent"
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {localeLabels[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
